import { Button } from '@/components/ui/Button';
import { useAuth } from '@/auth/AuthProvider';
import './Login.css';

export function AuthLoading() {
  return (
    <div className="auth-status">
      <div className="spinner" />
      <p className="auth-status__text">רגע אחד...</p>
    </div>
  );
}

export function AuthDenied() {
  const { error, signIn, logout } = useAuth();
  return (
    <div className="auth-status">
      <div className="auth-status__emoji">🔒</div>
      <h1 className="auth-status__title">אין הרשאת גישה</h1>
      <p className="auth-status__text">
        {error ?? 'המשתמש הזה לא מורשה להיכנס לאפליקציה.'}
      </p>
      <Button onClick={signIn}>נסו חשבון אחר</Button>
      <Button variant="ghost" onClick={logout}>
        חזרה
      </Button>
    </div>
  );
}

export function AuthUnconfigured() {
  return (
    <div className="auth-status">
      <div className="auth-status__emoji">⚙️</div>
      <h1 className="auth-status__title">Firebase עדיין לא מוגדר</h1>
      <p className="auth-status__text">
        כדי להפעיל התחברות וסנכרון נתונים, יש להגדיר את משתני הסביבה של Firebase
        בקובץ <span className="auth-status__code">.env</span>. הפרטים המלאים
        נמצאים בקובץ <span className="auth-status__code">README.md</span>.
      </p>
    </div>
  );
}
