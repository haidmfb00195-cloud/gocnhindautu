import { Mail, MapPin, Phone } from 'lucide-react';
import { getSiteConfig } from '@/lib/site-config';
import ContactForm from '@/components/contact/ContactForm';

export default async function ContactPage() {
  const config = await getSiteConfig();

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2 text-foreground uppercase flex items-center gap-2">
        <span className="w-1 h-8 bg-primary rounded-full inline-block"></span>
        Liên hệ với chúng tôi
      </h1>
      <p className="text-text-secondary mb-10 ml-3">Đừng ngần ngại để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative">
          <ContactForm />
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-background-secondary p-6 rounded-xl border border-border">
            <h3 className="font-bold text-lg mb-4 text-foreground">Thông tin liên hệ</h3>
            <ul className="flex flex-col gap-4">
              {config.contact_email && (
                <li className="flex gap-3 text-text-secondary">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <a href={`mailto:${config.contact_email}`} className="hover:text-primary transition-colors">
                    {config.contact_email}
                  </a>
                </li>
              )}
              {config.contact_phone && (
                <li className="flex gap-3 text-text-secondary">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <a href={`tel:${config.contact_phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                    {config.contact_phone}
                  </a>
                </li>
              )}
              {config.contact_address && (
                <li className="flex gap-3 text-text-secondary">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <span>{config.contact_address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
