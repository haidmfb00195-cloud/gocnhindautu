import AffiliateCard from './AffiliateCard';

const MOCK_PARTNERS = [
  { id: 1, name: 'FTMO', logoUrl: '', offerText: 'Chiết khấu 10%', affiliateUrl: '#' },
  { id: 2, name: 'The5ers', logoUrl: '', offerText: 'Giảm 5% phí', affiliateUrl: '#' },
  { id: 3, name: 'FundingPips', logoUrl: '', offerText: 'Hoàn phí 100%', affiliateUrl: '#' },
  { id: 4, name: 'FundedNext', logoUrl: '', offerText: 'Ưu đãi 15%', affiliateUrl: '#' },
  { id: 5, name: 'Exness', logoUrl: '', offerText: 'Bonus 20%', affiliateUrl: '#' },
];

export default function AffiliateGrid() {
  return (
    <section className="section py-8">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2 uppercase">
          <span className="w-1 h-6 bg-primary rounded-full inline-block"></span>
          Quỹ & Sàn giao dịch nổi bật
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {MOCK_PARTNERS.map(partner => (
            <AffiliateCard key={partner.id} {...partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
