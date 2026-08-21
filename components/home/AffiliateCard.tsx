import Image from 'next/image';

interface AffiliateCardProps {
  name: string;
  logoUrl: string;
  offerText: string;
  affiliateUrl: string;
}

export default function AffiliateCard({ name, logoUrl, offerText, affiliateUrl }: AffiliateCardProps) {
  return (
    <a 
      href={affiliateUrl}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="card flex flex-col items-center text-center gap-3 p-6 group hover:border-primary transition-all"
    >
      <div className="w-16 h-16 relative rounded-full overflow-hidden bg-background-secondary border border-border group-hover:shadow-glow transition-shadow">
        {logoUrl ? (
          <Image src={logoUrl} alt={name} fill className="object-contain p-2" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-white text-black">{name.charAt(0)}</div>
        )}
      </div>
      <h3 className="font-bold text-foreground text-lg">{name}</h3>
      <p className="text-primary font-medium text-sm">{offerText}</p>
    </a>
  );
}
