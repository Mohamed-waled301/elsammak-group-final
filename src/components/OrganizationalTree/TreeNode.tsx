import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Minus, Plus, UserRound } from 'lucide-react';
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
}

const roleIconById: Record<string, JSX.Element> = {
  chairman: <Crown size={16} />,
};

function TreeNode({ node, depth, isExpanded, onToggle }: TreeNodeProps) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const hasBio = Boolean(node.bio?.ar);
  const hasName = Boolean(node.name?.ar);
  const isExpandable = hasChildren || hasBio;
  const interactiveIds = new Set(['chairman', 'exec', 'admin']);
  const isInteractive = interactiveIds.has(node.id);
  const isStaticNode = !isInteractive;
  const shouldShowChildren = node.id === 'board' ? hasChildren : hasChildren && isExpanded;
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

  return (
    <li className={`org-node ${depth > 0 ? 'org-node-nested' : ''}`}>
      {isStaticNode ? (
        <div className="org-node-static" aria-disabled="true">
          <span className="org-node-title">{node.title.ar}</span>
        </div>
      ) : (
        <button
          type="button"
          className={`org-node-button ${isExpanded ? 'org-node-button-open' : ''} ${node.id === 'chairman' ? 'org-node-button-featured' : ''}`}
          onClick={handleClick}
        >
          <span className="org-node-role-icon">{icon}</span>

          <span className="org-node-text">
            <span className="org-node-title">{node.title.ar}</span>
            {hasName && <span className="org-node-name">{node.name?.ar}</span>}
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
            className="org-tree-level"
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
              alt={node.name?.ar || 'رئيس مجلس الإدارة'}
              className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg border object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallbackApplied) {
                  img.dataset.fallbackApplied = 'true';
                  img.src = '/images/avatar-placeholder.svg';
                }
              }}
            />
            <h4 className="org-node-bio-name">{node.name?.ar}</h4>
            <div className="org-node-bio-text">
              {(node.bio?.ar || '').split('\n\n').map((paragraph, index) => (
                <p key={`chairman-bio-${index}`}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function TreeLevel({ nodes, depth }: TreeLevelProps) {
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
            isExpanded={expandedId === node.id}
            onToggle={() => setExpandedId((current) => (current === node.id ? null : node.id))}
          />
        </motion.div>
      ))}
    </ul>
  );
}
