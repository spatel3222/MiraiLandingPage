import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { supabase } from '../../lib/supabase';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email.toLowerCase().trim(),
            message: message.trim() || null,
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('This email is already on the waitlist!');
        } else {
          setErrorMessage(error.message);
        }
        setStatus('error');
        return;
      }

      setStatus('success');
      setEmail('');
      setMessage('');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: 'var(--opportunity-green-glow)' }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: 'var(--opportunity-green)' }} />
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            You're on the list!
          </h3>
          <p style={{ color: 'var(--professional-gray)' }}>
            We'll reach out when we're ready to expand access.
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3
            className="text-center text-lg font-medium mb-6"
            style={{ color: 'var(--foreground)' }}
          >
            Join the Waitlist
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500/50 focus:ring-blue-500/20"
                style={{
                  boxShadow: '0 0 20px var(--accent-blue-glow)',
                }}
              />
            </div>

            <Textarea
              placeholder="Tell us about your use case (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none"
            />

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm"
                style={{ color: '#ef4444' }}
              >
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={status === 'loading' || !email}
              className="w-full h-12 font-medium transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--tech-accent) 100%)',
                boxShadow: '0 0 30px var(--accent-blue-glow)',
              }}
            >
              {status === 'loading' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Request Access
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
