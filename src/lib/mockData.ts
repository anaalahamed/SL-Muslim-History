import { Article, NewsPost, Category } from './types'

export const mockCategories: Category[] = [
  { id: '1', name_en: 'Early History', name_ta: 'ஆரம்பகால வரலாறு', slug: 'early-history', icon: '📜', article_count: 42, parent_id: null },
  { id: '2', name_en: 'Mosques & Places', name_ta: 'மசூதிகள் & இடங்கள்', slug: 'mosques-places', icon: '🕌', article_count: 31, parent_id: null },
  { id: '3', name_en: 'Culture & Traditions', name_ta: 'கலாச்சாரம் & மரபுகள்', slug: 'culture-traditions', icon: '🎨', article_count: 27, parent_id: null },
  { id: '4', name_en: 'Notable Figures', name_ta: 'சிறப்பு ஆளுமைகள்', slug: 'notable-figures', icon: '👑', article_count: 18, parent_id: null },
  { id: '5', name_en: 'Literature & Arts', name_ta: 'இலக்கியம் & கலை', slug: 'literature-arts', icon: '📖', article_count: 22, parent_id: null },
  { id: '6', name_en: 'Community & Society', name_ta: 'சமூகம் & கல்வி', slug: 'community-society', icon: '🤝', article_count: 35, parent_id: null },
]

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'அரபு வணிகர்கள்: இலங்கையில் இஸ்லாத்தின் தோற்றம்',
    slug: 'arab-traders-origins-of-islam-in-sri-lanka',
    excerpt: 'பண்டைய மசாலா வர்த்தக பாதைகளில் பயணித்த அரபு வணிகர்கள் எவ்வாறு இலங்கையில் இஸ்லாத்தை முதன்முதலில் கொண்டு வந்தனர் என்பதை அறிந்துகொள்ளுங்கள். கி.பி. 7 ஆம் நூற்றாண்டு முதல் இன்று வரையான வரலாற்றுப் பயணம்.',
    content: `அரபு வணிகர்களின் வருகை

கி.பி. 7 ஆம் நூற்றாண்டில், இஸ்லாத்தின் தோற்றத்திற்கு சற்று முன்னரே, அரபு வணிகர்கள் இந்திய மகாசமுத்திரம் வழியாக இலங்கையுடன் வர்த்தக தொடர்புகளை மேற்கொண்டிருந்தனர். மசாலா, துணிமணி, மற்றும் விலைமதிக்கமுடியாத கற்கள் வர்த்தகம் அவர்களை இந்த தீவு நாட்டிற்கு ஈர்த்தது.

இஸ்லாத்தின் தோற்றத்திற்கு பின்னர், இந்த வணிகர்கள் புதிய நம்பிக்கையுடன் திரும்பி வந்தனர். அவர்கள் வெறும் பொருட்களை மட்டும் கொண்டு வரவில்லை — அவர்களோடு ஒரு புதிய வாழ்க்கை முறை, ஒரு புதிய தர்மம், மற்றும் ஒரு புதிய நாகரீகமும் வந்தது.

கரையோர குடியேற்றங்கள்

ஆரம்பத்தில், இந்த முஸ்லிம் வணிகர்கள் இலங்கையின் மேற்கு மற்றும் தென்மேற்கு கரையோரங்களில் குடியேறினர். பேருவளை (பெர்உவலை), கொழும்பு, மற்றும் காலி போன்ற துறைமுக நகரங்கள் அவர்களின் முதல் இருப்பிடங்களாயின.

இந்த வணிகர்கள் உள்ளூர் பெண்களை மணந்து, அரபு-சிங்களவர் மற்றும் அரபு-திராவிட கலப்பின சமூகத்தை உருவாக்கினர். இதுவே இன்றைய இலங்கை முஸ்லிம் சமூகத்தின் அடிப்படையாகும்.

சிங்கள அரசர்களுடன் உறவு

சிங்கள அரசர்கள் இந்த வணிகர்களை வரவேற்றனர், ஏனெனில் அவர்கள் அரசவைக்கு வரி மூலம் வருமானம் கொண்டு வந்தனர் மற்றும் சர்வதேச வர்த்தகத்தை ஊக்குவித்தனர். சில முஸ்லிம் வணிகர்கள் அரச அலுவலர்களாகவும் நியமிக்கப்பட்டனர்.

கி.பி. 10 ஆம் நூற்றாண்டில், இந்த முஸ்லிம் சமூகம் கணிசமான அளவில் வளர்ந்திருந்தது. அவர்கள் தங்கள் சொந்த மசூதிகளை கட்டத் தொடங்கினர் மற்றும் தங்கள் கலாச்சாரத்தை பாதுகாக்கத் தொடங்கினர்.

வர்த்தகத்தின் மூலம் பரவல்

இஸ்லாம் இலங்கையில் வாள் மூலம் பரவவில்லை. அது அன்பு, நல்லொழுக்கம், மற்றும் வர்த்தக நம்பகத்தன்மை மூலம் மனிதர்களை ஈர்த்தது. அரபு வணிகர்களின் நேர்மை மற்றும் நியாயமான வர்த்தக நடைமுறைகள் பலரை இஸ்லாத்தில் ஆர்வம் கொள்ளச் செய்தன.

இன்று, இலங்கையில் 10% க்கும் அதிகமான முஸ்லிம் மக்கள் தொகை உள்ளது — இவர்கள் அனைவரும் அந்த தொலைதூர அரபு வணிகர்களின் வழித்தோன்றல்கள்.`,
    category: 'Early History',
    category_slug: 'early-history',
    author: 'டாக்டர் A. முஹம்மட்',
    featured_image: '',
    views: 8240,
    is_featured: true,
    author_id: null,
    author_link: '',
    gallery: [],
    categories: [],
    published_at: '2026-03-10T00:00:00Z',
  },
  {
    id: '2',
    title: 'கெச்சிமலை மசூதி: 1,000 ஆண்டு வரலாறு',
    slug: 'kechimalai-mosque-1000-year-history',
    excerpt: 'பேருவளையில் அமைந்துள்ள கெச்சிமலை மசூதி இலங்கையின் மிகவும் பழமையான மசூதிகளில் ஒன்றாகும். இதன் தோற்றம், வரலாறு மற்றும் சமகால முக்கியத்துவம் பற்றிய விரிவான ஆய்வு.',
    content: '',
    category: 'Mosques & Places',
    category_slug: 'mosques-places',
    author: 'Z. அபூபக்கர்',
    featured_image: '',
    views: 5610,
    is_featured: true,
    author_id: null,
    author_link: '',
    gallery: [],
    categories: [],
    published_at: '2026-03-05T00:00:00Z',
  },
  {
    id: '3',
    title: 'கண்டியன் இராச்சியத்தில் முஸ்லிம் வணிகர்கள்',
    slug: 'muslim-traders-kandyan-kingdom',
    excerpt: 'கண்டியன் அரச காலத்தில் முஸ்லிம் வணிகர்கள் வகித்த முக்கிய பங்கு மற்றும் அரசவையில் அவர்களின் செல்வாக்கு பற்றிய ஆழமான ஆய்வு.',
    content: '',
    category: 'Early History',
    category_slug: 'early-history',
    author: 'M. ஃபசீல்',
    featured_image: '',
    views: 4120,
    is_featured: true,
    author_id: null,
    author_link: '',
    gallery: [],
    categories: [],
    published_at: '2026-02-28T00:00:00Z',
  },
  {
    id: '4',
    title: 'சூஃபி மரபுகள் மற்றும் தர்காக்கள்',
    slug: 'sufi-traditions-dargahs-sri-lanka',
    excerpt: 'இலங்கையில் சூஃபி இஸ்லாமின் வேர்கள் மற்றும் தர்காக்களின் ஆன்மீக முக்கியத்துவம். இன்றும் தொடரும் சூஃபி மரபுகளின் கதை.',
    content: '',
    category: 'Culture & Traditions',
    category_slug: 'culture-traditions',
    author: 'I. ஹமீட்',
    featured_image: '',
    views: 3820,
    is_featured: false,
    author_id: null,
    author_link: '',
    gallery: [],
    categories: [],
    published_at: '2026-02-20T00:00:00Z',
  },
  {
    id: '5',
    title: 'இலங்கை முஸ்லிம் உணவு பாரம்பரியம்',
    slug: 'sri-lanka-muslim-food-heritage',
    excerpt: 'அரபு, மலாய் மற்றும் இலங்கை சமையல் கலாச்சாரங்களின் கலவையில் உருவான தனித்துவமான முஸ்லிம் உணவு மரபுகள்.',
    content: '',
    category: 'Culture & Traditions',
    category_slug: 'culture-traditions',
    author: 'F. அமீனா',
    featured_image: '',
    views: 2940,
    is_featured: false,
    author_id: null,
    author_link: '',
    gallery: [],
    categories: [],
    published_at: '2026-02-15T00:00:00Z',
  },
  {
    id: '6',
    title: 'சர் ரசீக் ஃபரீட்: இலங்கை முஸ்லிம் தலைமை',
    slug: 'sir-razik-fareed-sri-lanka-muslim-leadership',
    excerpt: 'இலங்கை முஸ்லிம் சமூகத்தின் தலைசிறந்த தலைவர் சர் ரசீக் ஃபரீட் அவர்களின் வாழ்க்கை, பணிகள் மற்றும் நிரந்தரமான பங்களிப்பு.',
    content: '',
    category: 'Notable Figures',
    category_slug: 'notable-figures',
    author: 'டாக்டர் A. முஹம்மட்',
    featured_image: '',
    views: 6730,
    is_featured: false,
    author_id: null,
    author_link: '',
    gallery: [],
    categories: [],
    published_at: '2026-02-10T00:00:00Z',
  },
]

export const mockNews: NewsPost[] = [
  {
    id: '1',
    title: 'கொழும்பில் ரமழான் பாரம்பரிய கண்காட்சி திறப்பு',
    slug: 'ramadan-heritage-exhibition-colombo',
    excerpt: 'கொழும்பு தேசிய அருங்காட்சியகத்தில் இந்த ரமழான் மாதம் சிறப்பு முஸ்லிம் பாரம்பரிய கண்காட்சி திறக்கப்பட்டுள்ளது.',
    content: `கண்காட்சியின் சிறப்பு

கொழும்பு தேசிய அருங்காட்சியகத்தில் நடைபெறும் இந்த சிறப்பு கண்காட்சி, இலங்கை முஸ்லிம்களின் 1,400 ஆண்டு கால வரலாற்றை படங்கள், ஆவணங்கள் மற்றும் அரிய கலைப்பொருட்கள் மூலம் விளக்குகிறது.

கண்காட்சியில் என்ன இருக்கிறது?

மொத்தம் 200க்கும் மேற்பட்ட கலைப்பொருட்கள் காட்சிப்படுத்தப்பட்டுள்ளன. இதில் 14 ஆம் நூற்றாண்டு அரபு கையெழுத்து நூல்கள், பழமையான மசூதி வரைபடங்கள், மற்றும் இலங்கை முஸ்லிம் வரலாற்றில் முக்கிய இடம்பெற்றவர்களின் புகைப்படங்கள் அடங்கும்.

ரமழான் சிறப்பு நிகழ்வுகள்

கண்காட்சியின் சிறப்பு அம்சமாக, ஒவ்வொரு வெள்ளியும் மாலை 6 மணி முதல் 9 மணி வரை சிறப்பு நிகழ்ச்சிகள் நடைபெறும். வரலாற்று நிபுணர்கள் உரையாடல்கள் நடத்துவார்கள் மற்றும் பாரம்பரிய கலை நிகழ்வுகள் இடம்பெறும்.

நேரம் மற்றும் இடம்

கண்காட்சி தினமும் காலை 9 மணி முதல் மாலை 5 மணி வரை திறந்திருக்கும். நுழைவு இலவசம். கொழும்பு தேசிய அருங்காட்சியகம், சர் மார்க்கஸ் ஃபெர்னாண்டோ மாவத்தை, கொழும்பு 7.`,
    category: 'Community',
    featured_image: '',
    is_breaking: true,
    published_at: '2026-03-20T00:00:00Z',
  },
  {
    id: '2',
    title: '14 ஆம் நூற்றாண்டு கையெழுத்து நூல்கள் தேசிய காப்பகத்திற்கு',
    slug: '14th-century-manuscripts-national-archives',
    excerpt: 'அரிய 14 ஆம் நூற்றாண்டு அரபு மொழி கையெழுத்து நூல்கள் தேசிய காப்பகத்தில் பாதுகாப்புக்கு ஒப்படைக்கப்பட்டன.',
    content: '',
    category: 'Heritage',
    featured_image: '',
    is_breaking: true,
    published_at: '2026-03-18T00:00:00Z',
  },
  {
    id: '3',
    title: 'பேருவளை மசூதி புனரமைப்புக்கு அரசாங்க நிதி அனுமதி',
    slug: 'beruwala-mosque-restoration-government-funding',
    excerpt: 'பேருவளை பெரிய மசூதியின் வரலாற்று முக்கியத்துவம் வாய்ந்த கட்டிடத்தை புனரமைக்க அரசாங்கம் நிதி ஒதுக்கியுள்ளது.',
    content: '',
    category: 'Heritage',
    featured_image: '',
    is_breaking: false,
    published_at: '2026-03-15T00:00:00Z',
  },
  {
    id: '4',
    title: 'இலங்கை முஸ்லிம் இளைஞர் வரலாற்று மாநாடு',
    slug: 'sri-lanka-muslim-youth-history-conference',
    excerpt: 'இளைஞர் முஸ்லிம் வரலாற்று ஆர்வலர்களை ஒன்றிணைக்கும் தேசிய மாநாடு ஏப்ரல் மாதம் நடைபெறவுள்ளது.',
    content: '',
    category: 'Education',
    featured_image: '',
    is_breaking: false,
    published_at: '2026-03-12T00:00:00Z',
  },
  {
    id: '5',
    title: 'கண்டியில் புதிய இஸ்லாமிய ஆய்வு மையம் திறப்பு',
    slug: 'new-islamic-research-centre-kandy',
    excerpt: 'கண்டி நகரில் முஸ்லிம் வரலாறு மற்றும் கலாச்சாரத்தை ஆவணப்படுத்துவதற்கான புதிய ஆய்வு மையம் திறக்கப்பட்டது.',
    content: '',
    category: 'Education',
    featured_image: '',
    is_breaking: false,
    published_at: '2026-03-08T00:00:00Z',
  },
  {
    id: '6',
    title: 'இலங்கை முஸ்லிம் வரலாற்று புத்தகம் — புதிய பதிப்பு வெளியீடு',
    slug: 'sri-lanka-muslim-history-book-new-edition',
    excerpt: 'பேராசிரியர் M.A. நூஃமான் எழுதிய "இலங்கை முஸ்லிம்களின் வரலாறு" நூலின் புதிய, விரிவாக்கப்பட்ட பதிப்பு வெளியிடப்பட்டுள்ளது.',
    content: '',
    category: 'Literature',
    featured_image: '',
    is_breaking: false,
    published_at: '2026-03-05T00:00:00Z',
  },
  {
    id: '7',
    title: 'கல்முனை பழைய மசூதி — யுனெஸ்கோ பாரம்பரிய தளமாக பரிந்துரை',
    slug: 'kalmunai-old-mosque-unesco-heritage-nomination',
    excerpt: 'கல்முனையில் உள்ள 800 ஆண்டு பழமையான மசூதியை யுனெஸ்கோ உலக பாரம்பரிய தளமாக அறிவிக்க அரசாங்கம் முயற்சி மேற்கொள்கிறது.',
    content: '',
    category: 'Heritage',
    featured_image: '',
    is_breaking: true,
    published_at: '2026-03-01T00:00:00Z',
  },
  {
    id: '8',
    title: 'முஸ்லிம் பெண்களின் வரலாற்றுப் பங்களிப்பு — புதிய ஆவணப்படம்',
    slug: 'muslim-women-historical-contributions-documentary',
    excerpt: 'இலங்கை முஸ்லிம் பெண்களின் வரலாற்றுப் பங்களிப்பை பதிவுசெய்யும் சிறப்பு ஆவணப்படம் தயாரிக்கப்பட்டுள்ளது.',
    content: '',
    category: 'Community',
    featured_image: '',
    is_breaking: false,
    published_at: '2026-02-25T00:00:00Z',
  },
]
