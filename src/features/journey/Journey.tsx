import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useAppStore } from '@/store/useAppStore';
import { useSound } from '@/hooks/useSound';
import { categoryMap } from '@/data/categories';
import { formatDate } from '@/lib/date';
import './Journey.css';

type Tab = 'memories' | 'timeline';

export function Journey() {
  const saved = useAppStore((s) => s.saved);
  const removeSaved = useAppStore((s) => s.removeSaved);
  const names = useAppStore((s) => s.names);
  const play = useSound();
  const [tab, setTab] = useState<Tab>('memories');

  if (saved.length === 0) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="האוסף שלנו"
          title="המסע שלנו"
          subtitle="כאן נאספים הרגעים והתשובות שבחרתם לשמור."
        />
        <div className="empty glass">
          <div className="empty__icon">
            <Icon name="heart" />
          </div>
          <h2 className="empty__title">עוד לא שמרתם זכרונות</h2>
          <p>ענו על שאלות ושמרו את הרגעים האהובים עליכם — הם יופיעו כאן.</p>
          <div style={{ marginTop: 'var(--s-5)' }}>
            <Link to="/categories">
              <Button>
                בואו נתחיל לדבר <Icon name="arrowL" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="האוסף שלנו"
        title="המסע שלנו"
        subtitle={`${saved.length} רגעים שבחרתם לשמור לנצח.`}
      />

      <div className="journey__tabs glass">
        {(['memories', 'timeline'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`journey__tab${tab === t ? ' is-active' : ''}`}
            onClick={() => {
              play('tap');
              setTab(t);
            }}
          >
            {tab === t && (
              <motion.span layoutId="journey-tab-pill" className="journey__tab-pill" />
            )}
            <Icon name={t === 'memories' ? 'star' : 'clock'} size={16} />
            <span>{t === 'memories' ? 'זכרונות' : 'ציר זמן'}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'memories' ? (
          <motion.div
            key="memories"
            className="journey__list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {saved.map((item) => {
              const cat = categoryMap[item.category];
              return (
                <motion.article
                  key={item.id}
                  layout
                  className="memory glass"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="memory__head">
                    <span className="chip">
                      {cat && <Icon name={cat.icon} />} {cat?.title}
                    </span>
                    <button
                      className="memory__del"
                      onClick={() => {
                        play('tap');
                        removeSaved(item.id);
                      }}
                      aria-label="מחק"
                    >
                      <Icon name="x" size={15} />
                    </button>
                  </div>
                  <p className="memory__q">{item.questionText}</p>
                  {(item.answerA || item.answerB) && (
                    <div className="memory__answers">
                      {item.answerA && (
                        <p className="memory__a">
                          <b>{names.a}:</b> {item.answerA}
                        </p>
                      )}
                      {item.answerB && (
                        <p className="memory__a">
                          <b>{names.b}:</b> {item.answerB}
                        </p>
                      )}
                    </div>
                  )}
                  <time className="memory__date">{formatDate(item.createdAt)}</time>
                </motion.article>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            className="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {saved.map((item, i) => (
              <motion.div
                key={item.id}
                className="timeline__item"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <span className="timeline__dot">
                  {categoryMap[item.category] && (
                    <Icon name={categoryMap[item.category].icon} size={14} />
                  )}
                </span>
                <div className="timeline__content glass">
                  <time className="timeline__date">{formatDate(item.createdAt)}</time>
                  <p className="timeline__q">{item.questionText}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
