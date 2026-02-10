// LoginView.tsx
import { useState } from "react";

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  authError: string | null;
  onClearError: () => void;
  onResendVerification: (email: string) => Promise<void>;
  showVerificationMessage: boolean;
  emailForVerification: string;
  onBackToLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onRegister,
  authError,
  onClearError,
  onResendVerification,
  showVerificationMessage,
  emailForVerification,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setIsLoading(true);
    onClearError();
    
    try {
      if (isRegistering) {
        await onRegister(email, password);
      } else {
        await onLogin(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    await onResendVerification(emailForVerification);
    setIsLoading(false);
  };

  // Verification message screen
  if (showVerificationMessage) {
    return (
      <div className="w-full max-w-md mx-auto p-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
          <p className="text-stone-300 mb-6">
            We've sent a verification link to <span className="text-orange-400 font-semibold">{emailForVerification}</span>. 
            Please check your inbox and click the link to verify your account.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Resend Verification Email"}
            </button>
            <button
              onClick={onBackToLogin}
              className="w-full py-3 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h2 className="text-3xl font-black text-white text-center mb-2">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-stone-400 text-center mb-8">
          {isRegistering ? "Sign up to get started" : "Sign in to continue"}
        </p>

        {authError && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-4 rounded-lg bg-black/30 border border-stone-500/30 text-white placeholder-stone-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 rounded-lg bg-black/30 border border-stone-500/30 text-white placeholder-stone-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              onClearError();
            }}
            className="text-stone-400 hover:text-orange-400 transition-colors"
          >
            {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;