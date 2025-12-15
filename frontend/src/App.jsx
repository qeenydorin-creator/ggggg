import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, User, Leaf, Sun, ThermometerSun,
  Plus, Minus, X, Globe, CheckCircle2, Check, ArrowRight, 
  ChevronDown, Loader2, Edit, Save, LogOut, LayoutDashboard, 
  Package, Server, Cpu, Activity, Menu, Search, Edit3, ArrowLeft,
  History, Sparkles, UploadCloud, ClipboardList, Truck, CheckSquare, AlertCircle,
  Briefcase, Mail, Phone, ChevronUp, Gift, Coins, Calendar, Award, Users, CreditCard,
  MapPin
} from 'lucide-react';

/**
 * ==============================================================================
 * 0. 配置与工具 (商用环境配置)
 * ==============================================================================
 */
// 获取 API 地址：优先读取环境变量。
// 在 Vercel 部署时，请务必在 Settings -> Environment Variables 中添加 VITE_API_URL
const getApiBaseUrl = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
  } catch (e) {}
  // 本地开发默认值，生产环境如果没有配置环境变量，这里可能会导致连接失败（符合商用安全逻辑）
  return "http://localhost:8000";
};
const API_BASE_URL = getApiBaseUrl();

// 商用级行政区划数据 (覆盖全国省份)
const ADDRESS_DATA = {
  "中国": {
    "北京市": { "北京市": ["东城区", "西城区", "朝阳区", "丰台区", "石景山区", "海淀区", "门头沟区", "房山区", "通州区", "顺义区", "昌平区", "大兴区", "怀柔区", "平谷区", "密云区", "延庆区"] },
    "天津市": { "天津市": ["和平区", "河东区", "河西区", "南开区", "河北区", "红桥区", "东丽区", "西青区", "津南区", "北辰区", "武清区", "宝坻区", "滨海新区", "宁河区", "静海区", "蓟州区"] },
    "河北省": {
      "石家庄市": ["长安区", "桥西区", "新华区", "井陉矿区", "裕华区", "藁城区", "鹿泉区", "栾城区", "井陉县", "正定县"],
      "唐山市": ["路南区", "路北区", "古冶区", "开平区", "丰南区", "丰润区", "曹妃甸区", "滦州市", "遵化市", "迁安市"],
      "秦皇岛市": ["海港区", "山海关区", "北戴河区", "抚宁区"],
      "邯郸市": ["邯山区", "丛台区", "复兴区", "峰峰矿区"],
      "保定市": ["竞秀区", "莲池区", "满城区", "清苑区", "徐水区"]
    },
    "山西省": { "太原市": ["小店区", "迎泽区", "杏花岭区"], "大同市": ["平城区", "云冈区"] },
    "内蒙古自治区": { "呼和浩特市": ["新城区", "回民区"], "包头市": ["昆都仑区", "青山区"] },
    "辽宁省": { "沈阳市": ["和平区", "沈河区", "皇姑区"], "大连市": ["中山区", "西岗区"] },
    "吉林省": { "长春市": ["南关区", "宽城区", "朝阳区"], "吉林市": ["船营区", "昌邑区"] },
    "黑龙江省": { "哈尔滨市": ["道里区", "南岗区"], "齐齐哈尔市": ["龙沙区", "建华区"] },
    "上海市": { "上海市": ["黄浦区", "徐汇区", "长宁区", "静安区", "普陀区", "虹口区", "杨浦区", "闵行区", "宝山区", "嘉定区", "浦东新区", "金山区", "松江区", "青浦区", "奉贤区", "崇明区"] },
    "江苏省": {
      "南京市": ["玄武区", "秦淮区", "建邺区", "鼓楼区", "浦口区", "栖霞区", "雨花台区", "江宁区"],
      "苏州市": ["虎丘区", "吴中区", "相城区", "姑苏区", "吴江区", "常熟市", "昆山市"],
      "无锡市": ["梁溪区", "滨湖区", "惠山区", "锡山区", "新吴区"]
    },
    "浙江省": {
      "杭州市": ["上城区", "拱墅区", "西湖区", "滨江区", "萧山区", "余杭区", "临平区", "钱塘区"],
      "宁波市": ["海曙区", "江北区", "北仑区", "镇海区", "鄞州区"],
      "温州市": ["鹿城区", "龙湾区", "瓯海区"]
    },
    "安徽省": {
      "合肥市": ["瑶海区", "庐阳区", "蜀山区", "包河区", "肥东县", "肥西县"],
      "芜湖市": ["镜湖区", "弋江区", "鸠江区"],
      "池州市": ["贵池区", "东至县", "石台县", "青阳县"],
      "黄山市": ["屯溪区", "黄山区", "徽州区", "歙县", "休宁县", "黟县", "祁门县"],
      "安庆市": ["迎江区", "大观区", "宜秀区", "桐城市"]
    },
    "福建省": { "福州市": ["鼓楼区", "台江区"], "厦门市": ["思明区", "海沧区", "湖里区"] },
    "江西省": { "南昌市": ["东湖区", "西湖区"], "赣州市": ["章贡区", "南康区"] },
    "山东省": { "济南市": ["历下区", "市中区"], "青岛市": ["市南区", "市北区"] },
    "河南省": { "郑州市": ["中原区", "二七区", "金水区"], "洛阳市": ["老城区", "西工区"] },
    "湖北省": { "武汉市": ["江岸区", "江汉区", "武昌区"], "宜昌市": ["西陵区", "伍家岗区"] },
    "湖南省": { "长沙市": ["芙蓉区", "天心区", "岳麓区"], "株洲市": ["天元区", "芦淞区"] },
    "广东省": {
      "广州市": ["荔湾区", "越秀区", "海珠区", "天河区", "白云区", "黄埔区", "番禺区"],
      "深圳市": ["罗湖区", "福田区", "南山区", "宝安区", "龙岗区", "盐田区", "龙华区"],
      "珠海市": ["香洲区", "斗门区", "金湾区"],
      "佛山市": ["禅城区", "南海区", "顺德区"],
      "东莞市": ["东莞市"],
      "中山市": ["中山市"]
    },
    "广西壮族自治区": { "南宁市": ["青秀区", "兴宁区"], "桂林市": ["秀峰区", "象山区"] },
    "海南省": { "海口市": ["秀英区", "龙华区"], "三亚市": ["海棠区", "吉阳区"] },
    "重庆市": { "重庆市": ["万州区", "涪陵区", "渝中区", "江北区", "沙坪坝区", "九龙坡区", "南岸区", "北碚区", "渝北区", "巴南区"] },
    "四川省": { "成都市": ["锦江区", "青羊区", "金牛区", "武侯区", "成华区"], "绵阳市": ["涪城区", "游仙区"] },
    "贵州省": { "贵阳市": ["南明区", "云岩区"], "遵义市": ["红花岗区", "汇川区"] },
    "云南省": { "昆明市": ["五华区", "盘龙区", "官渡区"], "大理白族自治州": ["大理市"] },
    "西藏自治区": { "拉萨市": ["城关区", "堆龙德庆区"] },
    "陕西省": { "西安市": ["新城区", "碑林区", "雁塔区"], "咸阳市": ["秦都区", "渭城区"] },
    "甘肃省": { "兰州市": ["城关区", "七里河区"] },
    "青海省": { "西宁市": ["城东区", "城中区"] },
    "宁夏回族自治区": { "银川市": ["兴庆区", "金凤区"] },
    "新疆维吾尔自治区": { "乌鲁木齐市": ["天山区", "沙依巴克区"] },
    "香港特别行政区": { "香港": ["中西区", "湾仔区", "东区", "南区", "油尖旺区"] },
    "澳门特别行政区": { "澳门": ["花地玛堂区", "圣安多尼堂区"] },
    "台湾省": { "台北市": ["中正区", "大同区"], "新北市": ["板桥区", "新庄区"], "高雄市": ["楠梓区", "左营区"] }
  }
};

/**
 * ==============================================================================
 * 1. 基础设施
 * ==============================================================================
 */
const ToastContext = createContext();
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none px-4 md:px-0 w-full md:w-auto">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`pointer-events-auto px-4 py-3 rounded shadow-lg flex items-center gap-2 text-sm font-medium w-full md:min-w-[200px] ${t.type === 'success' ? 'bg-[#20a53a] text-white' : t.type === 'error' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
              {t.type === 'success' ? <CheckCircle2 size={16}/> : t.type === 'error' ? <AlertCircle size={16}/> : null}{t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
const useToast = () => useContext(ToastContext);

const siteImages = {
  logo: "https://res.cloudinary.com/dgzsameje/image/upload/v1765448194/logo_tjxf6k.jpg",
  heroBg: "https://res.cloudinary.com/dgzsameje/image/upload/v1765448215/hero-bg_i966ai.jpg",
  storyDigging: "https://res.cloudinary.com/dgzsameje/image/upload/v1765448203/story-digging_ouhilt.jpg",
  storyFresh: "https://res.cloudinary.com/dgzsameje/image/upload/v1765448212/story-fresh_auy7zd.jpg",
  craftWashing: "https://res.cloudinary.com/dgzsameje/image/upload/v1765448214/craft-washing_bt2pye.jpg",
  craftSteaming: "https://res.cloudinary.com/dgzsameje/image/upload/v1765448213/craft-steaming_lv1t6u.jpg",
  cultureMountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000",
  cultureHerb: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1000", 
  cultureZen: "https://images.unsplash.com/photo-1545665277-5937bf33dbc4?auto=format&fit=crop&q=80&w=1000",
  cultureMall: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=1000"
};

const LANGUAGES = [{ code: 'zh-CN', label: '简体中文' }, { code: 'en', label: 'English' }];
const I18N_DB = {
  'zh-CN': {
    brand: '国精集团:茶说九华', nav: { home: '首页', story: '源头工艺', products: '产品中心', culture: '禅养文化', mall: '积分商城', orders: '我的订单' },
    hero: { title: '道地九华山，九蒸九晒', sub: '传承千年古法，只为一颗好黄精', btn: '探索源头' },
    products: { title: '热销产品', loading: '加载中...', details: '查看详情', stock: '库存' },
    detail: { back: '返回', benefits: '核心功效', history: '历史溯源', addToCart: '加入茶篮' },
    story: { title: '从深山到杯中', sub: '每一道工序，都是对时间的致敬' },
    mall: { title: '积分商城', my_points: '我的积分', redeem: '积分兑换', streak: '连签天数', days: '天', sign_in: '签到', signed: '已签', redeem_btn: '兑换', rules: '消费10元=1积分，10积分抵扣1元' },
    recruit: { title: '加入我们', subtitle: '传承东方养生智慧', pos1: '高级茶艺师', pos1_desc: '负责高端接待', pos2: '新媒体运营', pos2_desc: '品牌账号运营', pos3: '种植专家', pos3_desc: '基地抚育指导' },
    user_orders: { title: '我的订单', no_orders: '暂无订单', status: { pending: '待付款', paid: '已付款', shipped: '已发货', completed: '已完成', cancelled: '已取消' } },
    member: { welcome: '会员中心', login: '登录', register: '注册', toggle_register: '去注册', toggle_login: '去登录' },
    culture: {
      title: '禅养九华 · 仙草之源', subtitle: '探寻北纬30度的自然奇迹',
      s1_title: '灵山九华 · 地藏道场', s1_desc: '九华山，不仅是中国佛教四大名山之一，更是著名的“东南第一山”。这里常年云雾缭绕，气候湿润，土壤富含微量元素硒，为黄精的生长提供了得天独厚的自然环境。',
      s2_title: '仙人余粮 · 多花黄精', s2_desc: '黄精古称“仙人余粮”，九华山所产多花黄精，肉质肥厚，色泽黄润。历代高僧大德常以黄精为食，以此补气养阴，健脾润肺，是药食同源的上品。',
      s3_title: '禅茶一味 · 修身养性', s3_desc: '在九华山，茶不仅是饮品，更是一种修行。将黄精融入茶道，琥珀色的汤色中蕴含着岁月的沉淀。一口入喉，甘甜回味，让人在喧嚣尘世中找回内心的宁静。',
      s4_title: '积分商城 · 尊享礼遇', s4_desc: '会员消费即可累积国精积分，积分可用于兑换九华山祈福文创、限量版黄精礼盒及高端茶具。让您的每一次消费都充满惊喜。'
    }
  },
  'en': {
    brand: 'Guojing Group', nav: { home: 'Home', story: 'Origin', products: 'Products', culture: 'Culture', mall: 'Points Mall', orders: 'Orders' },
    hero: { title: 'Authentic Mt. Jiuhua', sub: 'Ancient methods', btn: 'Explore' },
    products: { title: 'Best Sellers', loading: 'Loading...', details: 'View', stock: 'Stock' },
    detail: { back: 'Back', benefits: 'Benefits', history: 'History', addToCart: 'Add to Cart' },
    story: { title: 'From Mountain to Cup', sub: 'Tribute to time' },
    mall: { title: 'Points Mall', my_points: 'My Points', redeem: 'Redeem', streak: 'Streak', days: 'days', sign_in: 'Check In', signed: 'Checked', redeem_btn: 'Redeem', rules: '10 RMB = 1 Point' },
    recruit: { title: 'Join Us', subtitle: 'Inherit Wisdom', pos1: 'Tea Specialist', pos1_desc: 'Reception', pos2: 'Media Manager', pos2_desc: 'Operations', pos3: 'Expert', pos3_desc: 'Cultivation' },
    user_orders: { title: 'My Orders', no_orders: 'No orders', status: { pending: 'Pending', paid: 'Paid', shipped: 'Shipped', completed: 'Completed', cancelled: 'Cancelled' } },
    member: { welcome: 'Member Center', login: 'Login', register: 'Register', toggle_register: 'Sign Up', toggle_login: 'Login' },
    culture: { title: 'Zen Culture', subtitle: 'Miracle of N30°', s1_title: 'Holy Mt. Jiuhua', s1_desc: 'Unique environment.', s2_title: 'Food of Immortals', s2_desc: 'Replenish energy.', s3_title: 'Zen & Tea', s3_desc: 'Meditation.', s4_title: 'Points Mall', s4_desc: 'Earn points and redeem gifts.' }
  }
};

const LanguageContext = createContext();
const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('zh-CN');
  const t = (key) => {
    const keys = key.split('.');
    let res = I18N_DB[lang];
    if (!res) res = I18N_DB['zh-CN'];
    for (const k of keys) res = res?.[k];
    if (!res) { let fallback = I18N_DB['zh-CN']; for (const k of keys) fallback = fallback?.[k]; return fallback || key; }
    return res;
  };
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
};
const useLanguage = () => useContext(LanguageContext);

// --- 独立组件定义 (严格顺序：先子组件，后主组件) ---

const Navbar = ({ t, lang, setLang, activePage, navigate, cartCount, openCart, openMember }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="flex justify-between p-4 sticky top-0 bg-white z-40 shadow">
      {/* Mobile Menu Button */}
      <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div onClick={() => navigate('home')} className="flex items-center gap-3 cursor-pointer">
        <img src={siteImages.logo} className="h-10 w-10 md:h-12 md:w-12 object-contain" alt="Logo" />
        <span className="text-lg md:text-xl font-bold text-gray-800">{t('brand')}</span>
      </div>

      <div className="hidden md:flex gap-4 items-center">
        {['home','story','products','culture','mall','orders'].map(k => (
          <button 
            key={k} 
            onClick={() => navigate(k)} 
            className={`hover:text-stone-800 transition-colors ${activePage === k ? 'font-bold text-stone-800' : 'text-gray-500'}`}
          >
            {t(`nav.${k}`)}
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <button onClick={() => setLang(lang === 'zh-CN' ? 'en' : 'zh-CN')} className="text-sm font-bold text-gray-600 hover:text-stone-800 border px-2 py-1 rounded">
          {lang === 'zh-CN' ? 'CN' : 'EN'}
        </button>
        <div onClick={openCart} className="relative cursor-pointer text-gray-600 hover:text-stone-800">
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </div>
        <button onClick={openMember} className="text-gray-600 hover:text-stone-800">
          <User size={24} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 overflow-hidden md:hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              {['home', 'story', 'products', 'culture', 'mall', 'orders'].map(key => (
                <button 
                  key={key} 
                  onClick={() => { navigate(key); setMobileMenuOpen(false); }} 
                  className={`text-left text-lg py-2 border-b border-gray-50 ${activePage === key ? 'text-stone-800 font-bold' : 'text-gray-600'}`}
                >
                  {t(`nav.${key}`)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ContactUs = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="max-w-3xl mx-auto mb-20 px-4">
      <div className="bg-stone-900 text-white p-4 rounded-lg cursor-pointer flex justify-between items-center hover:bg-black transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <span className="font-bold tracking-widest pl-2">联系我们</span>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><ChevronUp /></div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-stone-800 text-gray-300 p-6 rounded-b-lg border-t border-stone-700 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-stone-700 p-2 rounded-full"><Phone size={18} /></div>
                <div><div className="text-xs opacity-50 mb-1">联系电话</div><div className="text-[#d4af37] font-mono text-lg font-bold select-text">19956618186</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-stone-700 p-2 rounded-full"><Mail size={18} /></div>
                <div><div className="text-xs opacity-50 mb-1">企业邮箱</div><div className="text-[#d4af37] font-mono text-sm md:text-base font-bold select-text break-all">chashuojiuhua@qygjsw.com.cn</div></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RecruitmentSection = ({ t }) => (
  <section className="py-20 border-t bg-white">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-3xl font-bold mb-4 text-stone-800">{t('recruit.title')}</h2>
      <p className="text-stone-500 mb-12">{t('recruit.subtitle')}</p>
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-stone-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto text-[#d4af37] shadow-sm"><Briefcase size={20} /></div>
            <h3 className="font-bold text-lg mb-2">{t(`recruit.pos${i}`)}</h3>
            <p className="text-sm text-gray-600">{t(`recruit.pos${i}_desc`)}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProductList = ({ t, products, loading, addToCart, onProductClick }) => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-stone-800">{t('products.title')}</h2>
      {loading ? (
        <div className="text-center text-gray-500 py-20">{t('products.loading')}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-20">暂无商品数据，请确保后端服务已启动</div>
      ) : (
        <div className="grid md:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="border p-4 rounded-xl hover:shadow-lg transition group">
              <div 
                onClick={() => onProductClick(p)} 
                className="cursor-pointer h-48 bg-gray-50 mb-4 rounded flex items-center justify-center relative overflow-hidden"
              >
                <img 
                  src={p.image} 
                  className="h-40 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform" 
                  alt={p.name}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white px-3 py-1 text-sm rounded shadow text-stone-800 font-bold">{t('products.details')}</span>
                </div>
              </div>
              <h3 className="font-bold truncate text-stone-800 mb-1">{p.name}</h3>
              <p className="text-xs text-gray-400 mb-3">{t('products.stock')}: {p.stock}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-red-600 font-bold text-lg">¥{p.price}</span>
                <button 
                  onClick={() => addToCart(p)} 
                  className="bg-stone-800 text-white px-3 py-1.5 rounded text-xs hover:bg-stone-700 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> {t('detail.addToCart')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
);

const ProductDetailPage = ({ product, onBack, addToCart, t }) => {
  if (!product) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <button onClick={onBack} className="flex items-center text-gray-500 mb-8"><ArrowLeft className="mr-2"/>{t('detail.back')}</button>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-[#f9f9f9] rounded-xl p-8"><img src={product.image} className="w-full h-[400px] object-contain mix-blend-multiply" onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=No+Image"; }}/></div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <div className="text-3xl font-bold text-red-600">¥{product.price}</div>
            <p className="text-gray-600 border-l-4 border-stone-800 pl-4">{product.desc}</p>
            <div className="bg-gray-50 p-4 rounded"><h3 className="font-bold mb-2">功效</h3><p>{product.benefits}</p></div>
            <div className="bg-gray-50 p-4 rounded"><h3 className="font-bold mb-2">历史溯源</h3><p>{product.history}</p></div>
            <button onClick={()=>addToCart(product)} className="w-full bg-stone-800 text-white py-4 rounded font-bold">加入茶篮</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CartDrawer = ({ isOpen, onClose, items, onCheckout, onUpdateQty, onSetQty }) => {
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="absolute right-0 h-full w-[85%] md:w-96 bg-white shadow-xl p-6 flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between mb-4"><h2 className="font-bold text-lg">茶篮</h2><X className="cursor-pointer" onClick={onClose}/></div>
        <div className="flex-1 overflow-y-auto space-y-4">
          {items.length === 0 ? <p className="text-gray-400 text-center mt-10">空的...</p> : items.map((i,idx)=>(
            <div key={idx} className="border-b py-2 flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm font-bold truncate pr-2">{i.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => onUpdateQty(i.id, -1)} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"><Minus size={14} /></button>
                  <input type="text" value={i.qty} onChange={(e) => {const val = parseInt(e.target.value); if (!isNaN(val)) onSetQty(i.id, val); else if (e.target.value === '') onSetQty(i.id, '');}} onBlur={(e) => {if (e.target.value === '' || parseInt(e.target.value) === 0) onSetQty(i.id, 0);}} className="w-10 text-center text-xs border-b border-gray-200 outline-none mx-1"/>
                  <button onClick={() => onUpdateQty(i.id, 1)} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"><Plus size={14} /></button>
                </div>
              </div>
              <span className="font-bold text-red-600 text-sm md:text-base">¥{i.price * i.qty}</span>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between font-bold text-lg mb-4"><span>合计</span><span>¥{total}</span></div>
          <button onClick={onCheckout} disabled={items.length===0} className="w-full bg-stone-800 text-white py-3 rounded font-bold disabled:opacity-50">去结算</button>
        </div>
      </div>
    </div>
  );
};

const CheckoutModal = ({ isOpen, onClose, cartItems, onPlaceOrder, userPoints }) => {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', country: '中国', province: '', city: '', district: '', detailAddress: '' });
  const [provinces, setProvinces] = useState(Object.keys(ADDRESS_DATA["中国"]));
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [usePoints, setUsePoints] = useState(false);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const maxDiscount = Math.floor(userPoints / 10);
  const actualDiscount = usePoints ? Math.min(maxDiscount, total) : 0;
  const finalPrice = total - actualDiscount;
  const pointsToGain = Math.floor(finalPrice / 10);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setForm({ ...form, phone: val });
  };

  const handleProvinceChange = (e) => {
    const p = e.target.value;
    setForm({ ...form, province: p, city: '', district: '' });
    if (p && ADDRESS_DATA["中国"][p]) {
      setCities(Object.keys(ADDRESS_DATA["中国"][p]));
      setDistricts([]);
    } else {
      setCities([]);
      setDistricts([]);
    }
  };

  const handleCityChange = (e) => {
    const c = e.target.value;
    setForm({ ...form, city: c, district: '' });
    const p = form.province;
    if (p && c && ADDRESS_DATA["中国"][p][c]) {
      setDistricts(ADDRESS_DATA["中国"][p][c]);
    } else {
      setDistricts([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.phone.length !== 11) return addToast("请输入11位手机号", "error");
    if (!form.province || !form.city || !form.district) return addToast("请选择完整地址", "error");
    const fullAddr = `${form.country} ${form.province} ${form.city} ${form.district} ${form.detailAddress}`;
    onPlaceOrder({ name: form.name, phone: form.phone, address: fullAddr, total, points_redeemed: actualDiscount * 10 });
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">订单结算</h2><X className="cursor-pointer" onClick={onClose} /></div>
        <div className="bg-stone-50 p-4 rounded mb-4 text-sm">
          <div className="flex justify-between font-bold"><span>总计</span><span>¥{total}</span></div>
          <div className="flex justify-between items-center mt-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={usePoints} onChange={e=>setUsePoints(e.target.checked)} disabled={userPoints<10} /> 积分抵扣 (余{userPoints})</label>
            <span className="text-red-500">-¥{actualDiscount}</span>
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t font-bold text-lg text-red-600"><span>实付</span><span>¥{finalPrice}</span></div>
          <div className="text-right text-xs text-green-600 mt-1">预计获得 {pointsToGain} 积分</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required className="w-full border p-2 rounded" placeholder="姓名" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input required className="w-full border p-2 rounded" placeholder="手机号 (11位)" maxLength={11} value={form.phone} onChange={handlePhoneChange} />
          <div className="grid gap-2">
            <div className="flex gap-2">
              <select className="border p-2 rounded w-1/3" value={form.province} onChange={handleProvinceChange}><option value="">省</option>{provinces.map(p=><option key={p} value={p}>{p}</option>)}</select>
              <select className="border p-2 rounded w-1/3" value={form.city} onChange={handleCityChange}><option value="">市</option>{cities.map(c=><option key={c} value={c}>{c}</option>)}</select>
              <select className="border p-2 rounded w-1/3" value={form.district} onChange={e=>setForm({...form, district:e.target.value})}><option value="">区</option>{districts.map(d=><option key={d} value={d}>{d}</option>)}</select>
            </div>
            <textarea required className="w-full border p-2 rounded" placeholder="详细地址" rows={2} value={form.detailAddress} onChange={e=>setForm({...form, detailAddress:e.target.value})} />
          </div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 bg-gray-100 rounded hover:bg-gray-200">再想想</button><button type="submit" className="flex-1 py-3 bg-[#d4af37] text-white rounded font-bold hover:bg-[#b8962e]">提交订单</button></div>
        </form>
      </div>
    </div>
  );
};

const MemberModal = ({ isOpen, onClose, isLoggedIn, onLogin, onRegister, onLogout }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({phone:'', password:''});
  
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center relative" onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-stone-800"><X size={20}/></button>
        <h3 className="font-bold mb-6 text-xl">{isLoggedIn ? t('member.welcome') : mode==='login'?t('member.login'):t('member.register')}</h3>
        {isLoggedIn ? (
          <div className="space-y-3">
            <button onClick={()=>onLogin({})} className="w-full bg-[#20a53a] text-white py-2 rounded font-bold">进入后台管理</button>
            <button onClick={onLogout} className="w-full border border-gray-300 py-2 rounded text-gray-500">退出登录</button>
          </div>
        ) : (
          <div className="space-y-3">
            <input className="w-full border p-2 rounded text-sm" placeholder="手机号" onChange={e=>setForm({...form, phone:e.target.value})}/>
            <input className="w-full border p-2 rounded text-sm" type="password" placeholder="密码" onChange={e=>setForm({...form, password:e.target.value})}/>
            <button onClick={()=>mode==='login'?onLogin(form):onRegister(form)} className="w-full bg-stone-800 text-white py-2 rounded font-bold">{mode==='login'?'立即登录':'立即注册'}</button>
            <p className="text-xs text-gray-500 cursor-pointer underline mt-2" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?t('member.toggle_register'):t('member.toggle_login')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CulturePage = ({ t }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#f9f9f7] pb-20 pt-20">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold mb-8">禅养文化</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col items-center p-6 hover:shadow-2xl transition-all">
          <h3 className="text-2xl font-bold text-stone-800 mb-2">{t('culture.s1_title')}</h3>
          <p className="text-stone-600 text-sm leading-relaxed">{t('culture.s1_desc')}</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col items-center p-6 hover:shadow-2xl transition-all">
          <h3 className="text-2xl font-bold text-stone-800 mb-2">{t('culture.s2_title')}</h3>
          <p className="text-stone-600 text-sm leading-relaxed">{t('culture.s2_desc')}</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col items-center p-6 hover:shadow-2xl transition-all">
          <h3 className="text-2xl font-bold text-stone-800 mb-2">{t('culture.s3_title')}</h3>
          <p className="text-stone-600 text-sm leading-relaxed">{t('culture.s3_desc')}</p>
        </div>
      </div>
      
      {/* 积分商城入口卡片 */}
      <div className="mt-16 bg-gradient-to-r from-stone-800 to-stone-900 rounded-2xl p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl">
        <div className="text-left mb-6 md:mb-0">
          <h3 className="text-3xl font-bold flex items-center gap-3 mb-2"><Gift className="text-[#d4af37]" /> {t('culture.s4_title')}</h3>
          <p className="opacity-80 max-w-xl">{t('culture.s4_desc')}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
          <div className="text-center">
            <Coins className="w-12 h-12 mx-auto mb-2 text-[#d4af37]" />
            <span className="text-xs uppercase tracking-widest opacity-70">Points Mall</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const UserOrdersPage = ({ t, isLoggedIn, onOpenLogin }) => {
  const [orders, setOrders] = useState([]);
  const { addToast } = useToast();
  useEffect(() => {
    if (isLoggedIn) {
      fetch(`${API_BASE_URL}/api/orders`, { headers: { token: localStorage.getItem('auth_token') } })
        .then(r=>r.json()).then(setOrders).catch(()=>addToast("加载订单失败", "error"));
    }
  }, [isLoggedIn]);
  
  if (!isLoggedIn) return <div className="pt-32 text-center"><p className="mb-4">请先登录</p><button onClick={onOpenLogin} className="bg-stone-800 text-white px-4 py-2 rounded">登录</button></div>;

  return (
    <div className="pt-24 pb-20 container mx-auto px-6 min-h-screen">
      <h2 className="text-3xl font-bold mb-8">{t('user_orders.title')}</h2>
      <div className="space-y-4">
        {orders.length===0 ? <div className="text-gray-400 text-center py-10">{t('user_orders.no_orders')}</div> : orders.map(o=>(
          <div key={o.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{o.created_at}</span>
              <span className={`px-2 py-0.5 rounded ${o.status==='paid'?'bg-blue-100 text-blue-700':'bg-gray-100'}`}>{t(`user_orders.status.${o.status}`)}</span>
            </div>
            {o.items.map((i,idx)=>(<div key={idx} className="flex gap-4 mb-2"><img src={i.image} className="w-16 h-16 rounded bg-gray-50 object-cover"/><div><div className="font-bold">{i.name}</div><div className="text-xs text-gray-500">x{i.qty}</div></div></div>))}
            <div className="text-right border-t pt-2 mt-2">实付: <span className="text-red-600 font-bold">¥{o.final_amount}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PointsMallPage = ({ t, isLoggedIn, onOpenLogin, onRedeemProduct }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState(null);
  const [mallProducts, setMallProducts] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('auth_token');
      fetch(`${API_BASE_URL}/api/user/profile`, { headers: { token } })
        .then(res => res.ok ? res.json() : null)
        .then(data => setUserProfile(data));
    }
    fetch(`${API_BASE_URL}/api/mall/products`).then(res => res.json()).then(setMallProducts);
  }, [isLoggedIn, activeTab]);

  const handleCheckIn = async () => {
    if (!isLoggedIn) return onOpenLogin();
    if (userProfile?.is_checked_in_today) return;
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/checkin`, { method: 'POST', headers: { token } });
      const data = await res.json();
      if (res.ok) {
        addToast(`签到成功！积分 +${data.points_added}`, 'success');
        setUserProfile(prev => ({ ...prev, points: data.total_points, checkin_streak: data.streak, is_checked_in_today: true }));
      } else { addToast(data.message, 'info'); }
    } catch { addToast("网络错误", 'error'); }
  };

  const handleRedeem = (item) => {
    if (!isLoggedIn) return onOpenLogin();
    if (!userProfile || userProfile.points < item.points_required) {
      addToast("积分不足", "error");
      return;
    }
    if (window.confirm(`确定消耗 ${item.points_required} 积分兑换 ${item.name} 吗？`)) {
      onRedeemProduct(item);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#f9f9f7] pb-20">
      <div className="bg-[#2c3e50] text-white py-16 px-6 relative overflow-hidden">
        <div className="container mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center">
          <div><h2 className="text-3xl font-serif font-bold mb-2 flex items-center gap-2"><Gift /> {t('mall.title')}</h2><p className="opacity-80 text-sm max-w-md">{t('mall.rules')}</p></div>
          <div className="mt-6 md:mt-0 flex gap-4 bg-white/10 p-1 rounded-lg backdrop-blur-sm">
            <button onClick={()=>setActiveTab('dashboard')} className={`px-6 py-2 rounded-md transition-all ${activeTab==='dashboard'?'bg-[#d4af37] text-white font-bold':'text-gray-300 hover:text-white'}`}>{t('mall.my_points')}</button>
            <button onClick={()=>setActiveTab('redeem')} className={`px-6 py-2 rounded-md transition-all ${activeTab==='redeem'?'bg-[#d4af37] text-white font-bold':'text-gray-300 hover:text-white'}`}>{t('mall.redeem')}</button>
          </div>
        </div>
        <Coins className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64" />
      </div>

      <div className="container mx-auto px-6 -mt-8 relative z-20">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left"><div className="text-gray-500 mb-2">当前积分余额</div><div className="text-6xl font-bold text-[#d4af37] font-mono">{userProfile ? userProfile.points : 0}</div>{!isLoggedIn && <button onClick={onOpenLogin} className="text-blue-500 text-sm underline mt-2">登录查看积分</button>}</div>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full border-4 border-[#d4af37]/20 flex items-center justify-center relative mb-4"><div className="text-center"><div className="text-xs text-gray-400">{t('mall.streak')}</div><div className="text-3xl font-bold text-stone-800">{userProfile ? userProfile.checkin_streak : 0}</div><div className="text-xs text-gray-400">{t('mall.days')}</div></div>{userProfile?.is_checked_in_today && <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-full"><Check size={16}/></div>}</div>
                <button onClick={handleCheckIn} disabled={userProfile?.is_checked_in_today} className={`px-8 py-3 rounded-full font-bold text-lg shadow-md transition-all flex items-center gap-2 ${userProfile?.is_checked_in_today ? 'bg-gray-200 text-gray-500 cursor-default' : 'bg-[#d4af37] text-white hover:bg-[#b8962e] hover:scale-105'}`}><Calendar size={20} />{userProfile?.is_checked_in_today ? t('mall.signed') : t('mall.sign_in')}</button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'redeem' && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mallProducts.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100 group">
                <div className="h-48 overflow-hidden bg-gray-50 relative"><img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /><div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">仅剩 {item.stock} 件</div></div>
                <div className="p-5"><h3 className="font-bold text-stone-800 mb-2 truncate">{item.name}</h3><div className="flex justify-between items-center"><span className="text-[#d4af37] font-bold font-mono text-lg flex items-center gap-1"><Coins size={14}/> {item.points_required}</span><button onClick={()=>handleRedeem(item)} className="bg-stone-800 text-white px-3 py-1.5 rounded text-xs hover:bg-[#d4af37] transition-colors">{t('mall.redeem_btn')}</button></div></div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ... 其他组件 ...
const BaotaAdminPanel = ({ products, onUpdateProduct, onExit }) => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editForm, setEditForm] = useState(null);
  const [orders, setOrders] = useState([]);
  const [mallUsers, setMallUsers] = useState([]);
  const [mallProducts, setMallProducts] = useState([]);
  const [editingMallProduct, setEditingMallProduct] = useState(null);
  const [editingUserPoints, setEditingUserPoints] = useState(null);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetch(`${API_BASE_URL}/api/orders`, { headers: { token: 'admin-secure-token' } }).then(res => res.json()).then(setOrders).catch(e=>console.error(e));
    }
    if (activeTab === 'mall_users') {
      fetch(`${API_BASE_URL}/api/admin/users`, { headers: { token: 'admin-secure-token' } }).then(res => res.json()).then(setMallUsers).catch(e=>console.error(e));
    }
    if (activeTab === 'mall_products') {
      fetch(`${API_BASE_URL}/api/mall/products`).then(res => res.json()).then(setMallProducts).catch(e=>console.error(e));
    }
  }, [activeTab]);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        addToast("订单状态已更新", "success");
      }
    } catch { addToast("更新失败", "error"); }
  };

  const handleUpdateUserPoints = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/users/${editingUserPoints.phone}/points`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ points: parseInt(editingUserPoints.points) })
      });
      setMallUsers(mallUsers.map(u => u.phone === editingUserPoints.phone ? { ...u, points: parseInt(editingUserPoints.points) } : u));
      setEditingUserPoints(null);
      addToast("积分修改成功", "success");
    } catch { addToast("修改失败", "error"); }
  };

  const handleUpdateMallProduct = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/mall/products/${editingMallProduct.id}`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(editingMallProduct)
      });
      setMallProducts(mallProducts.map(p => p.id === editingMallProduct.id ? editingMallProduct : p));
      setEditingMallProduct(null);
      addToast("积分商品更新成功", "success");
    } catch { addToast("更新失败", "error"); }
  };

  const startEdit = (p) => setEditForm({ ...p });
  const saveEdit = () => { onUpdateProduct(editForm.id, editForm); setEditForm(null); };
  const filteredProducts = products.filter(p => p.name.includes(searchTerm));

  const handleImageUpload = (e, setFunc, currentForm) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFunc({ ...currentForm, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs whitespace-nowrap">待付款</span>;
      case 'paid': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs whitespace-nowrap">已付款</span>;
      case 'shipped': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs whitespace-nowrap">已发货</span>;
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs whitespace-nowrap">已完成</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs whitespace-nowrap">已取消</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs whitespace-nowrap">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#f0f2f5] font-sans text-gray-700 overflow-hidden">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#20222a] text-gray-300 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-700"><h1 className="text-xl font-bold text-white tracking-wider">国精后台<span className="text-[#20a53a] text-xs ml-1">Pro</span></h1></div>
        <nav className="mt-6 px-2 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-[#20a53a] text-white' : 'hover:bg-gray-700'}`}><LayoutDashboard size={18} className="mr-3" />系统概览</button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${activeTab === 'products' ? 'bg-[#20a53a] text-white' : 'hover:bg-gray-700'}`}><Package size={18} className="mr-3" />产品管理</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${activeTab === 'orders' ? 'bg-[#20a53a] text-white' : 'hover:bg-gray-700'}`}><ClipboardList size={18} className="mr-3" />订单系统</button>
          
          <div className="px-4 py-2 text-xs text-gray-500 font-bold uppercase mt-4">积分商城管理</div>
          <button onClick={() => setActiveTab('mall_users')} className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${activeTab === 'mall_users' ? 'bg-[#20a53a] text-white' : 'hover:bg-gray-700'}`}><Users size={18} className="mr-3" />用户与积分</button>
          <button onClick={() => setActiveTab('mall_products')} className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${activeTab === 'mall_products' ? 'bg-[#20a53a] text-white' : 'hover:bg-gray-700'}`}><Gift size={18} className="mr-3" />积分商品</button>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700"><button onClick={onExit} className="flex items-center text-gray-400 hover:text-white transition-colors w-full"><LogOut size={18} className="mr-2" /> 返回前台</button></div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600"><Menu /></button>
          <span className="text-sm text-gray-500">Admin Mode (Protected)</span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <div className="text-center text-gray-400 mt-20">欢迎使用国精后台管理系统</div>}
          
          {activeTab === 'products' && (
            <div className="bg-white rounded shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100 flex justify-between"><h2 className="text-lg font-bold border-l-4 border-[#20a53a] pl-3">商品库</h2></div>
              <table className="w-full text-left text-sm"><tbody className="divide-y">{filteredProducts.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="p-4 flex gap-2 items-center"><img src={p.image} className="w-8 h-8 rounded"/>{p.name}</td><td className="p-4">¥{p.price}</td><td className="p-4 text-blue-500 cursor-pointer" onClick={()=>startEdit(p)}>编辑</td></tr>))}</tbody></table>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold border-l-4 border-[#20a53a] pl-3">订单管理</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                    <tr><th className="p-4">订单号</th><th className="p-4">客户</th><th className="p-4">实付</th><th className="p-4">积分</th><th className="p-4">状态</th><th className="p-4">操作</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-gray-400">暂无订单数据</td></tr> : orders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-mono text-xs text-gray-500">{o.order_no}</div>
                          <div className="text-[10px] text-gray-400">{o.created_at}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs">{o.customer_name}</div>
                          <div className="text-xs text-gray-400">{o.customer_phone}</div>
                        </td>
                        <td className="p-4 font-bold text-[#ff9900]">¥{o.final_amount}</td>
                        <td className="p-4 text-xs">
                          {o.points_redeemed > 0 && <span className="text-red-500 block">抵扣 -{o.points_redeemed}</span>}
                          {o.points_gained > 0 && <span className="text-green-500 block">赠送 +{o.points_gained}</span>}
                        </td>
                        <td className="p-4">{getStatusBadge(o.status)}</td>
                        <td className="p-4 flex gap-2">
                          {o.status === 'paid' && <button onClick={()=>updateOrderStatus(o.id, 'shipped')} className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">发货</button>}
                          {o.status === 'shipped' && <button onClick={()=>updateOrderStatus(o.id, 'completed')} className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">完成</button>}
                          {o.status !== 'cancelled' && o.status !== 'completed' && <button onClick={()=>updateOrderStatus(o.id, 'cancelled')} className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs hover:bg-gray-300">取消</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'mall_users' && (
            <div className="bg-white rounded shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold border-l-4 border-[#20a53a] pl-3">用户积分管理</h2></div>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 font-bold"><tr><th className="p-4">用户</th><th className="p-4">手机号</th><th className="p-4">当前积分</th><th className="p-4">连签天数</th><th className="p-4">操作</th></tr></thead>
                <tbody className="divide-y">
                  {mallUsers.map(u => (
                    <tr key={u.phone} className="hover:bg-gray-50">
                      <td className="p-4">{u.username}</td>
                      <td className="p-4">{u.phone}</td>
                      <td className="p-4 font-bold text-[#d4af37]">{u.points}</td>
                      <td className="p-4">{u.checkin_streak}天</td>
                      <td className="p-4"><button onClick={()=>setEditingUserPoints(u)} className="text-blue-600 hover:underline">修改积分</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'mall_products' && (
            <div className="bg-white rounded shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold border-l-4 border-[#20a53a] pl-3">积分商品配置</h2></div>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 font-bold"><tr><th className="p-4">商品图</th><th className="p-4">名称</th><th className="p-4">所需积分</th><th className="p-4">库存</th><th className="p-4">操作</th></tr></thead>
                <tbody className="divide-y">
                  {mallProducts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-4"><img src={p.image} className="w-10 h-10 rounded object-cover"/></td>
                      <td className="p-4">{p.name}</td>
                      <td className="p-4 font-bold text-[#d4af37]">{p.points_required}</td>
                      <td className="p-4">{p.stock}</td>
                      <td className="p-4"><button onClick={()=>setEditingMallProduct(p)} className="text-blue-600 hover:underline">编辑</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {(editForm || editingMallProduct) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-2"><h3 className="font-bold text-lg">编辑信息</h3><X className="cursor-pointer" onClick={()=>{setEditForm(null); setEditingMallProduct(null)}}/></div>
              {editForm ? (
                <>
                  <div className="flex gap-4 items-center bg-gray-50 p-2 rounded"><img src={editForm.image} className="w-16 h-16 rounded"/><label className="cursor-pointer text-blue-500 text-sm"><input type="file" hidden onChange={e=>handleImageUpload(e, setEditForm, editForm)}/>更换图片</label></div>
                  <input className="w-full border p-2 rounded" placeholder="名称" value={editForm.name} onChange={e=>setEditForm({...editForm, name:e.target.value})}/>
                  <div className="flex gap-2"><input type="number" className="w-1/2 border p-2 rounded" placeholder="价格" value={editForm.price} onChange={e=>setEditForm({...editForm, price:e.target.value})}/><input type="number" className="w-1/2 border p-2 rounded" placeholder="库存" value={editForm.stock} onChange={e=>setEditForm({...editForm, stock:e.target.value})}/></div>
                  <button onClick={saveEdit} className="w-full bg-[#20a53a] text-white py-2 rounded">保存修改</button>
                </>
              ) : (
                <>
                  <div className="flex gap-4 items-center bg-gray-50 p-2 rounded"><img src={editingMallProduct.image} className="w-16 h-16 rounded"/><label className="cursor-pointer text-blue-500 text-sm"><input type="file" hidden onChange={e=>handleImageUpload(e, setEditingMallProduct, editingMallProduct)}/>更换图片</label></div>
                  <input className="w-full border p-2 rounded" placeholder="商品名称" value={editingMallProduct.name} onChange={e=>setEditingMallProduct({...editingMallProduct, name:e.target.value})}/>
                  <div className="flex gap-2">
                    <input type="number" className="w-1/2 border p-2 rounded" placeholder="所需积分" value={editingMallProduct.points_required} onChange={e=>setEditingMallProduct({...editingMallProduct, points_required:e.target.value})}/>
                    <input type="number" className="w-1/2 border p-2 rounded" placeholder="库存" value={editingMallProduct.stock} onChange={e=>setEditingMallProduct({...editingMallProduct, stock:e.target.value})}/>
                  </div>
                  <button onClick={handleUpdateMallProduct} className="w-full bg-[#20a53a] text-white py-2 rounded">保存积分商品</button>
                </>
              )}
            </div>
          </div>
        )}

        {editingUserPoints && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-80 p-6 space-y-4">
              <h3 className="font-bold">修改用户积分</h3>
              <p className="text-sm text-gray-500">用户: {editingUserPoints.username}</p>
              <input type="number" className="w-full border p-2 rounded" value={editingUserPoints.points} onChange={e=>setEditingUserPoints({...editingUserPoints, points:e.target.value})} />
              <div className="flex gap-2">
                <button onClick={()=>setEditingUserPoints(null)} className="flex-1 border py-2 rounded">取消</button>
                <button onClick={handleUpdateUserPoints} className="flex-1 bg-[#20a53a] text-white py-2 rounded">确认</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// 6. 主控制器
const AppContent = () => {
  const { lang, setLang, t } = useLanguage();
  const { addToast } = useToast();
  const [activePage, setActivePage] = useState('home');
  const [cartOpen, setCartOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewProduct, setViewProduct] = useState(null);
  const [userPoints, setUserPoints] = useState(0);

  const fetchProducts = async () => { try { setLoading(true); const res = await fetch(`${API_BASE_URL}/api/products`); if (res.ok) setProducts(await res.json()); else setProducts(DEFAULT_PRODUCTS); } catch { setProducts(DEFAULT_PRODUCTS); } finally { setLoading(false); } };
  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('auth_token');
      fetch(`${API_BASE_URL}/api/user/profile`, { headers: { token } })
        .then(r=>r.json()).then(d=>setUserPoints(d.points || 0)).catch(()=>{});
    }
  }, [isLoggedIn, activePage]);

  const addToCart = (p) => { setCartItems(prev => { const exist = prev.find(i => i.id === p.id); return exist ? prev.map(i => i.id === p.id ? {...i, qty: i.qty+1} : i) : [...prev, {...p, qty:1}]; }); addToast(`${p.name} 已加入茶篮`, 'success'); setCartOpen(true); };
  const handleUpdateQty = (id, delta) => { setCartItems(prev => prev.reduce((acc, item) => { if (item.id === id) { const newQty = item.qty + delta; if (newQty > 0 && newQty <= 999) acc.push({ ...item, qty: newQty }); } else { acc.push(item); } return acc; }, [])); };
  const handleSetQty = (id, val) => { if (val === '') { setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: '' } : i)); return; } let newQty = Math.max(0, Math.min(999, parseInt(val))); setCartItems(prev => { if (newQty === 0) return prev.filter(i => i.id !== id); return prev.map(i => i.id === id ? { ...i, qty: newQty } : i); }); };
  const handleUpdateProduct = async (id, updatedData) => { try { await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }); fetchProducts(); addToast("成功", "success"); } catch { addToast("失败", "error"); } };
  
  const handleLogin = async (creds) => {
    if (isLoggedIn) { setActivePage('admin'); setMemberOpen(false); return; } // 已登录点击进入后台
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(creds) });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('auth_token', data.token);
        setIsLoggedIn(true); setMemberOpen(false); addToast("登录成功", "success");
        if (data.role === 'admin') setActivePage('admin');
      } else { addToast("登录失败", "error"); }
    } catch { addToast("错误", "error"); }
  };
  
  const handleRegister = async (creds) => { try { const res = await fetch(`${API_BASE_URL}/api/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(creds) }); if (res.ok) { addToast("注册成功", "success"); } else { const err = await res.json(); addToast(err.detail || "注册失败", "error"); } } catch { addToast("服务器连接失败", "error"); } };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('auth_token');
    setActivePage('home');
    setMemberOpen(false);
    addToast("已退出登录", "info");
  };

  const handlePlaceOrder = async (orderData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, { method: 'POST', headers: {'Content-Type': 'application/json', 'token': localStorage.getItem('auth_token')}, body: JSON.stringify({...orderData, items: cartItems, type: 'normal'}) });
      if (res.ok) { setCartItems([]); setCheckoutOpen(false); addToast("下单成功", "success"); }
    } catch { addToast("错误", "error"); }
  };

  // 积分商城兑换逻辑
  const handleRedeemProduct = async (product) => {
    // 构造一个0元订单
    const orderData = {
      customer_name: "积分兑换", // 简化，实际应弹窗让用户填
      customer_phone: "积分兑换",
      address: "积分兑换",
      total_amount: 0,
      points_redeemed: product.points_required,
      type: 'exchange'
    };
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json', 'token': localStorage.getItem('auth_token')}, 
        body: JSON.stringify({
          ...orderData, 
          items: [{id: product.id, name: product.name, price: 0, qty: 1, image: product.image}]
        }) 
      });
      if (res.ok) { addToast("兑换成功，请在订单中心查看", "success"); } 
      else { 
        const err = await res.json();
        addToast(err.detail || "兑换失败", "error"); 
      }
    } catch { addToast("兑换错误", "error"); }
  };

  if (activePage === 'admin') return <BaotaAdminPanel products={products} onUpdateProduct={handleUpdateProduct} onExit={() => setActivePage('home')} />;

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#2c3e50] font-sans">
      <Navbar t={t} lang={lang} setLang={setLang} activePage={activePage} navigate={setActivePage} cartCount={cartItems.reduce((a,b)=>a+(Number(b.qty)||0),0)} openCart={()=>setCartOpen(true)} openMember={()=>setMemberOpen(true)} />
      <main>
        <AnimatePresence mode="wait">
          {activePage === 'detail' && viewProduct ? (
            <ProductDetailPage key="detail" product={viewProduct} t={t} onBack={() => setActivePage('products')} addToCart={addToCart} />
          ) : activePage === 'mall' ? (
            <PointsMallPage key="mall" t={t} isLoggedIn={isLoggedIn} onOpenLogin={()=>setMemberOpen(true)} onRedeemProduct={handleRedeemProduct} />
          ) : activePage === 'orders' ? (
            <UserOrdersPage key="orders" t={t} isLoggedIn={isLoggedIn} onOpenLogin={()=>setMemberOpen(true)} />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {activePage === 'home' && <div className="h-[500px] flex items-center justify-center bg-gray-800 text-white relative"><img src={siteImages.heroBg} className="absolute inset-0 w-full h-full object-cover opacity-50"/><div className="relative z-10 text-center"><h1 className="text-5xl font-bold mb-4">{t('hero.title')}</h1><button onClick={()=>setActivePage('story')} className="bg-white text-black px-6 py-2 rounded-full">{t('hero.btn')}</button></div></div>}
              {(activePage === 'home' || activePage === 'story') && <div className="py-20 container mx-auto px-6 text-center"><h2 className="text-3xl font-bold mb-10">{t('story.title')}</h2><div className="grid md:grid-cols-4 gap-4">{[{t:"深山采挖",i:siteImages.storyDigging},{t:"鲜选原料",i:siteImages.storyFresh},{t:"泉水清洗",i:siteImages.craftWashing},{t:"九蒸九晒",i:siteImages.craftSteaming}].map((s,i)=><div key={i}><img src={s.i} className="h-40 w-full object-cover rounded mb-2"/><p>{s.t}</p></div>)}</div></div>}
              {(activePage === 'home' || activePage === 'products') && <ProductList t={t} products={products} loading={loading} addToCart={addToCart} onProductClick={(p)=>{setViewProduct(p); setActivePage('detail'); window.scrollTo(0,0)}} />}
              {activePage === 'culture' && <CulturePage t={t} />}
              {activePage === 'home' && <RecruitmentSection t={t} />}
              {activePage === 'home' && <ContactUs />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <footer className="bg-stone-900 text-gray-400 py-10 md:py-16 text-center"><p className="opacity-60 text-xs md:text-sm">© 2025 Guojing Group. All rights reserved.</p></footer>
      <CartDrawer isOpen={cartOpen} onClose={()=>setCartOpen(false)} items={cartItems} onCheckout={()=>{setCheckoutOpen(true)}} onUpdateQty={handleUpdateQty} onSetQty={handleSetQty} />
      <CheckoutModal isOpen={checkoutOpen} onClose={()=>setCheckoutOpen(false)} cartItems={cartItems} onPlaceOrder={handlePlaceOrder} userPoints={userPoints} />
      <MemberModal 
        isOpen={memberOpen} 
        onClose={()=>setMemberOpen(false)} 
        isLoggedIn={isLoggedIn} 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
        onLogout={handleLogout} 
      />
    </div>
  );
};

export default function App() { return <ToastProvider><LanguageProvider><AppContent /></LanguageProvider></ToastProvider>; }