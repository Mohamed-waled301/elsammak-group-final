import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { UserRound, X } from 'lucide-react';
import type { OrgNode } from './types';

interface BioDrawerProps {
  node: OrgNode;
  onClose: () => void;
}

export function BioDrawer({ node, onClose }: BioDrawerProps) {
  const [imageError, setImageError] = useState(false);

  const imageSrc = useMemo(() => {
    const imageMap: Record<string, string> = {
      chairman: '/images/waleed.jpg.jpeg',
      exec: '/images/wael.jpg.jpeg',
      admin: '/images/elkassar.jpg.jpeg',
    };
    return imageMap[node.id] || '';
  }, [node.id]);

  return (
    <>
      <motion.div
        className="org-bio-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.aside
        className="org-bio-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="org-bio-header">
          <button type="button" onClick={onClose} className="org-bio-close" aria-label="إغلاق">
            <X size={18} />
          </button>

          <div className="org-bio-avatar-wrap">
            {imageSrc && !imageError ? (
              <img
                key={`bio-image-${node.id}-${node.id === 'admin' ? 'elkassar-v2' : 'default'}`}
                src={node.id === 'admin' ? '/images/elkassar.jpg.jpeg?v=2' : imageSrc}
                alt={node.name?.ar || node.bioName?.ar || 'profile'}
                className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg border object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="org-bio-avatar-fallback">
                <UserRound size={38} />
              </div>
            )}
          </div>

          <h3>{node.name?.ar || node.bioName?.ar}</h3>
          <p>{node.title.ar}</p>
        </div>

        <div className="org-bio-content">
          {(node.bio?.ar || '').split('\n\n').map((paragraph, index) => (
            <p key={`bio-${node.id}-${index}`}>{paragraph}</p>
          ))}
        </div>
      </motion.aside>
    </>
  );
}
