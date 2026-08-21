'use client';
import { useState } from 'react';
import { Gift, ShieldCheck, Clock, Zap, HeartHandshake } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <section className="section bg-background pt-0">
      <div className="container mx-auto max-w-content">
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-3xl p-8 md:p-16 shadow-glow overflow-hidden relative">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex mb-6 items-center gap-2">
                <Gift className="w-5 h-5 text-white" />
                <span className="badge bg-white/20 text-white border border-white/30 font-bold uppercase tracking-wider text-[10px]">
                  Đăng ký nhận kiến thức miễn phí
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                Nhận kiến thức giao dịch mỗi tuần
              </h2>
              
              <p className="text-white/80 text-lg max-w-xl mx-auto lg:mx-0">
                Nhận những bài viết mới nhất về đầu tư, prop firm, công cụ giao dịch và chiến lược quản lý rủi ro.
              </p>
            </div>

            <div className="flex-1 w-full max-w-md">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3 bg-white p-1.5 rounded-xl md:rounded-full shadow-lg">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn..." 
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-800 placeholder:text-gray-400"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg md:rounded-full transition-colors w-full sm:w-auto flex items-center justify-center min-w-[140px]"
                  >
                    {status === 'loading' ? (
                      <span className="animate-pulse">Đang đăng ký...</span>
                    ) : status === 'success' ? (
                      <span>Thành công! 🎉</span>
                    ) : (
                      'Đăng ký ngay'
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-center lg:justify-start gap-6 mt-4 text-white/70 text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Không spam
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    Hơn 5,000 trader đang theo dõi
                  </span>
                </div>
              </form>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4 w-full max-w-sm ml-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/20 transition-colors">
                <Gift className="w-8 h-8 text-white" />
                <span className="text-white font-semibold text-sm">100% Miễn phí</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/20 transition-colors">
                <Zap className="w-8 h-8 text-white" />
                <span className="text-white font-semibold text-sm">Cập nhật liên tục</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/20 transition-colors">
                <ShieldCheck className="w-8 h-8 text-white" />
                <span className="text-white font-semibold text-sm">Đáng tin cậy</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/20 transition-colors">
                <Clock className="w-8 h-8 text-white" />
                <span className="text-white font-semibold text-sm">Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
