export default function AffiliateBannerHorizontal() {
  return (
    <div className="w-full bg-black py-6 my-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-black text-xs shrink-0">
            LOGO
          </div>
          <div>
            <h3 className="text-white text-xl font-bold mb-1">MỞ TÀI KHOẢN GIAO DỊCH NGAY</h3>
            <p className="text-gray-400 text-sm">Nhận ngay ưu đãi <span className="text-[#B6F500] font-bold px-2 py-0.5 bg-white/10 rounded">HOÀN PHÍ 20%</span> khi đăng ký qua link của Đừng Đầu Tư</p>
          </div>
        </div>
        <a 
          href="#"
          target="_blank"
          rel="nofollow sponsored noopener"
          className="btn bg-[#B6F500] hover:bg-[#9ED400] text-black font-bold whitespace-nowrap rounded-full px-8 py-3"
        >
          ĐĂNG KÝ NGAY
        </a>
      </div>
    </div>
  );
}
