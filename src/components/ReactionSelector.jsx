import { useState, useEffect } from 'react';
import { REACTIONS } from './reactions';
import { AnimatePresence, motion } from 'framer-motion';

const ReactionSelector = ({ currentReaction, onSelect }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const handleReactionSelect = (type) => {
    onSelect(type);
    setShowPicker(false);
  };

  return (
    <div className="position-relative">
      <button
        className={`btn btn-action ${currentReaction ? 'text-primary' : ''}`}
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
        aria-label="Réagir"
      >
        <span style={{ color: REACTIONS[currentReaction]?.color }}>
          {REACTIONS[currentReaction]?.emoji || '👍'}
        </span>
        <span className="d-none d-md-inline ms-1">
          {currentReaction || 'Réagir'}
        </span>
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="reaction-picker shadow rounded-pill bg-white p-2"
            onMouseEnter={() => setShowPicker(true)}
            onMouseLeave={() => setShowPicker(false)}
          >
            {Object.entries(REACTIONS).map(([type, { emoji, color }]) => (
              <button
                key={type}
                className="btn p-1 reaction-option"
                onClick={() => handleReactionSelect(type)}
                onMouseEnter={() => setHoveredReaction(type)}
                onMouseLeave={() => setHoveredReaction(null)}
                aria-label={type}
              >
                <motion.span
                  animate={{
                    scale: hoveredReaction === type ? 1.5 : 1,
                    y: hoveredReaction === type ? -10 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  style={{ fontSize: '1.5rem', display: 'block' }}
                >
                  {emoji}
                </motion.span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .reaction-picker {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          white-space: nowrap;
        }
        .reaction-option {
          transition: all 0.2s;
        }
        .reaction-option:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default ReactionSelector;