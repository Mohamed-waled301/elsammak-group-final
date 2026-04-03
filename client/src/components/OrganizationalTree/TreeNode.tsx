import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, Crown, Minus, Plus, UserRound } from 'lucide-react';
import type { OrgNode } from './types';

interface TreeLevelProps {
  nodes: OrgNode[];
  depth: number;
}

interface TreeNodeProps {
  node: OrgNode;
  depth: number;
  isExpanded: boolean;
  onToggle: () => void;
  lang: 'ar' | 'en';
  boardExpanded?: boolean;
  onBoardToggle?: () => void;
}

function pickLocalized(obj: { ar?: string | null; en?: string | null } | undefined, lang: 'ar' | 'en'): string {
  if (!obj) return '';
  const primary = lang === 'ar' ? obj.ar : obj.en;
  const fallback = lang === 'ar' ? obj.en : obj.ar;
  const p = primary != null ? String(primary).trim() : '';
  const f = fallback != null ? String(fallback).trim() : '';
  return p || f || '';
}

const roleIconById: Record<string, JSX.Element> = {
  chairman: <Crown size={16} />,
};

function TreeNode({ node, depth, isExpanded, onToggle, lang, boardExpanded, onBoardToggle }: TreeNodeProps) {
  const titleText = pickLocalized(node.title, lang);
  const nameText = pickLocalized(node.name, lang);
  const bioNameText = pickLocalized(node.bioName, lang) || nameText;
  const bioBody = pickLocalized(node.bio, lang);

  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const hasBio = Boolean(bioBody);
  const hasName = Boolean(nameText);
  const isExpandable = hasChildren || hasBio;
  const interactiveIds = new Set(['chairman', 'exec', 'admin']);
  const isInteractive = interactiveIds.has(node.id);
  const isBoardRoot = node.id === 'board';
  const isStaticNode = !isInteractive && !isBoardRoot;
  const boardOpen = Boolean(boardExpanded);
  const shouldShowChildren = isBoardRoot ? hasChildren && boardOpen : hasChildren && isExpanded;
  const showBioPanel = isInteractive && hasBio && isExpanded;
  const imageByNodeId: Record<string, string> = {
    chairman: '/images/waleed.jpg.jpeg',
    exec: '/images/wael.jpg.jpeg',
    admin: '/images/elkassar.jpg.jpeg',
  };

  const icon = useMemo(() => {
    if (roleIconById[node.id]) {
      return roleIconById[node.id];
    }
    return <UserRound size={16} />;
  }, [node.id]);

  const handleClick = () => {
    if (isInteractive && isExpandable) onToggle();
  };

  const displayName = bioNameText || nameText;

  return (
    <li className={`org-node ${depth > 0 ? 'org-node-nested' : ''}`}>
      {isBoardRoot ? (
        <button
          type="button"
          className={`org-node-button org-node-board-trigger ${boardOpen ? 'org-node-button-open' : ''}`}
          onClick={() => onBoardToggle?.()}
          aria-expanded={boardOpen}
          aria-controls="org-board-children"
          id="org-board-heading"
        >
          <span className="org-node-role-icon" aria-hidden="true">
            <Building2 size={16} />
          </span>
          <span className="org-node-text">
            <span className="org-node-title">{titleText}</span>
          </span>
          <span
            className={`org-node-board-chevron-wrap ${boardOpen ? 'org-node-board-chevron-wrap--open' : ''}`}
            aria-hidden="true"
          >
            <ChevronDown className="org-node-board-chevron" size={22} strokeWidth={2.25} />
          </span>
        </button>
      ) : isStaticNode ? (
        <div className="org-node-static" aria-disabled="true">
          <span className="org-node-title">{titleText}</span>
        </div>
      ) : (
        <button
          type="button"
          className={`org-node-button ${isExpanded ? 'org-node-button-open' : ''} ${node.id === 'chairman' ? 'org-node-button-featured' : ''}`}
          onClick={handleClick}
        >
          <span className="org-node-role-icon">{icon}</span>

          <span className="org-node-text">
            <span className="org-node-title">{titleText}</span>
            {hasName && <span className="org-node-name">{nameText}</span>}
          </span>

          {isExpandable && (
            <span className="org-node-toggle" aria-hidden="true">
              {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
            </span>
          )}
        </button>
      )}

      <AnimatePresence initial={false}>
        {shouldShowChildren && (
          <motion.ul
            id={isBoardRoot ? 'org-board-children' : undefined}
            className="org-tree-level"
            role={isBoardRoot ? 'region' : undefined}
            aria-labelledby={isBoardRoot ? 'org-board-heading' : undefined}
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <TreeLevel nodes={node.children || []} depth={depth + 1} />
          </motion.ul>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showBioPanel && (
          <motion.div
            className="org-node-bio-panel"
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={imageByNodeId[node.id] || '/images/avatar-placeholder.svg'}
              alt={displayName || titleText}
              className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg border object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallbackApplied) {
                  img.dataset.fallbackApplied = 'true';
                  img.src = '/images/avatar-placeholder.svg';
                }
              }}
            />
            <h4 className="org-node-bio-name">{displayName}</h4>
            <div className="org-node-bio-text">
              {bioBody.split('\n\n').map((paragraph, index) => (
                <p key={`${node.id}-bio-${index}`}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function TreeLevel({ nodes, depth, boardExpanded, onBoardToggle }: TreeLevelProps) {
  const { i18n } = useTranslation();
  const lang: 'ar' | 'en' = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ul className={`org-tree-level ${depth === 0 ? 'org-tree-root' : ''}`}>
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.24 }}
        >
          <TreeNode
            node={node}
            depth={depth}
            lang={lang}
            isExpanded={expandedId === node.id}
            onToggle={() => setExpandedId((current) => (current === node.id ? null : node.id))}
            boardExpanded={boardExpanded}
            onBoardToggle={onBoardToggle}
          />
        </motion.div>
      ))}
    </ul>
  );
}
