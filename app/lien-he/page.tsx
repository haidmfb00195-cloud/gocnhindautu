import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2 text-foreground uppercase flex items-center gap-2">
        <span className="w-1 h-8 bg-primary rounded-full inline-block"></span>
        Liên hệ với chúng tôi
      </h1>
      <p className="text-text-secondary mb-10 ml-3">Đừng ngần ngại để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <form className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Họ tên *</label>
              <input type="text" className="w-full bg-background-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary" placeholder="Nhập họ tên của bạn" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Email *</label>
              <input type="email" className="w-full bg-background-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary" placeholder="Email của bạn" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Tiêu đề</label>
              <input type="text" className="w-full bg-background-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary" placeholder="Bạn cần hỗ trợ gì?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Nội dung *</label>
              <textarea rows={5} className="w-full bg-background-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary resize-none" placeholder="Chi tiết lời nhắn..." required></textarea>
            </div>
            <button type="submit" className="btn bg-primary hover:bg-primary-hover text-black font-bold w-full py-3 rounded-lg mt-2 transition-colors">
              GỬI TIN NHẮN
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-background-secondary p-6 rounded-xl border border-border">
            <h3 className="font-bold text-lg mb-4 text-foreground">Thông tin liên hệ</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex gap-3 text-text-secondary">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>admin@dungdautu.com</span>
              </li>
              <li className="flex gap-3 text-text-secondary">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex gap-3 text-text-secondary">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
