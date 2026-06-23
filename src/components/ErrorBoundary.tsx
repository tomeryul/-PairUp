import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** When this value changes, the boundary resets (e.g. on route change). */
  resetKey?: string;
}
interface State {
  hasError: boolean;
}

/**
 * Contains render-time crashes so a single broken screen never takes the whole
 * app down (the bottom navigation stays usable). Resets automatically when the
 * route changes.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidUpdate(prev: Props) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty glass" style={{ marginTop: 'var(--s-6)' }}>
          <h2 className="empty__title">משהו השתבש במסך הזה</h2>
          <p>אפשר לעבור למסך אחר מהתפריט למטה ולנסות שוב.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
