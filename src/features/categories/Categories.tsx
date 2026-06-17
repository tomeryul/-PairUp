import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { categories } from '@/data/categories';
import { useSound } from '@/hooks/useSound';
import './Categories.css';

export function Categories() {
  const play = useSound();
  return (
    <div className="page">
      <PageHeader
        eyebrow="על מה נדבר היום?"
        title="קטגוריות"
        subtitle="בחרו נושא ותנו לשיחה לזרום. אפשר תמיד להחליף באמצע."
      />
      <div className="cat-grid">
        {categories.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={`/play/${c.id}`}
              className="cat-card glass"
              onClick={() => play('tap')}
              style={{ ['--cat-grad' as string]: c.gradient }}
            >
              <div className="cat-card__glow" />
              <span className="cat-card__emoji">{c.emoji}</span>
              <span className="cat-card__title">{c.title}</span>
              <span className="cat-card__desc">{c.description}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
