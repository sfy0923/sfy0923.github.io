import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import GlassSurface from './components/GlassSurface'
import Grainient from './components/Grainient'
import ColorBends from './components/ColorBends'

const ArrowUpRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ArrowDown = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 4v15m0 0 5-5m-5 5-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DotGrid = () => <span className="dot-grid" aria-hidden="true" />

const navItems = [
  { label: 'ABOUT', href: '#profile' },
  { label: 'WORK', href: '#projects' },
  { label: 'CAPABILITIES', href: '#capabilities' },
  { label: 'CONTACT', href: '#contact' },
]

const stats = [
  { value: '48', label: '矩阵账号', note: '简历自述' },
  { value: '3—5', label: '主播协同', note: '直播团队' },
  { value: '百万', label: '播放量级', note: '简历自述' },
  { value: '0→1', label: '账号搭建', note: '本地流量' },
]

const experience = [
  {
    index: '01',
    company: '天津众易融咨询有限公司',
    role: '新媒体市场',
    tags: ['抖音 / 快手 / 小红书', '矩阵运营', '直播协同'],
    copy: '负责多平台获客内容与矩阵账号运营，协同 3—5 位主播完成直播内容、节奏与引流策略。',
  },
  {
    index: '02',
    company: '星火纵横篮球俱乐部',
    role: '市场营销专员',
    tags: ['整合营销', '活动策划', '视觉物料'],
    copy: '从线上品宣到线下落地，参与赛事、训练营与粉丝活动的策划、物料制作和现场统筹。',
  },
  {
    index: '03',
    company: '深圳东怡数字科技有限公司',
    role: '矩阵号剪辑师',
    tags: ['信息流剪辑', '大批量内容', '投放优化'],
    copy: '面向新能源车金融服务客户，完成多账号信息流视频的创意剪辑与投放优化。',
  },
  {
    index: '04',
    company: '天津九段跆拳道 / 天津丽而康义齿口腔',
    role: '新媒体运营',
    tags: ['账号 0—1', '脚本 / 拍摄 / 剪辑', '数据复盘'],
    copy: '搭建本地同城账号矩阵，独立完成文案、分镜、拍摄、灯光、剪辑、发布与日常数据分析。',
  },
]

const projects = [
  {
    number: '01',
    title: '矩阵增长系统',
    type: '内容策略 / 账号运营',
    desc: '从账号筛选到内容分发，把一次创作拆成可持续执行的多平台节奏。',
    tone: 'cyan',
    meta: '抖音 · 快手 · 小红书',
    image: '/project-shanghai-night.png',
    imageAlt: '夜景城市露台上的人物与上海天际线',
  },
  {
    number: '02',
    title: '线下活动视觉链路',
    type: '活动策划 / 视觉物料',
    desc: '海报、传单、H5、预告与现场导视协同，让线上预热自然落到现场。',
    tone: 'violet',
    meta: '篮球赛事 · 训练营 · 品宣',
    image: '/experience-rain-city.png',
    imageAlt: '雨夜街头、霓虹招牌与行走中的人物',
  },
  {
    number: '03',
    title: 'AI 视觉实验场',
    type: 'AI 设计 / 视觉探索',
    desc: '以 AI 为加速器，探索从概念、画面到短内容的快速视觉表达。',
    tone: 'lime',
    meta: '定位模块 · 案例待补',
    image: '/profile-mist-meadow.png',
    imageAlt: '雾气笼罩的山野与手捧花束的人物远景',
  },
]

const capabilities = [
  {
    number: '01',
    title: '内容策略',
    body: '把目标、用户痛点和平台语境拆成能执行的选题与脚本。',
    accent: '策略先行',
  },
  {
    number: '02',
    title: '拍摄与剪辑',
    body: '从分镜、灯光到后期节奏，独立完成短视频生产链路。',
    accent: '从想法到成片',
  },
  {
    number: '03',
    title: '视觉设计',
    body: '海报、包装、H5、背景板等物料，保持品牌在不同触点上的一致。',
    accent: '视觉系统',
  },
  {
    number: '04',
    title: 'AI 创作',
    body: '将 AI 作为视觉探索与生产提效工具，具体工具与案例持续补充中。',
    accent: '实验进行时',
  },
]

function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="site-shell" id="top">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="brand-mark" href="#top" aria-label="返回首页">
          <span className="brand-monogram">S<span>/</span>F</span>
          <span className="brand-caption">SUN FUYANG</span>
        </a>
        <nav className="nav-links" aria-label="页面导航">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <a className="nav-contact" href="#contact">
          联系我 <ArrowUpRight size={16} />
        </a>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <video className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
            <source src="/hero-loop.mp4" type="video/mp4" />
          </video>
          <div className="hero-color-bends" aria-hidden="true">
            <ColorBends
              colors={['#964193', '#4d29db', '#b497cf']}
              rotation={118}
              speed={0.16}
              autoRotate={4}
              scale={1.15}
              frequency={1.15}
              warpStrength={1.2}
              mouseInfluence={0.35}
              parallax={0.24}
              noise={0.08}
              iterations={2}
              intensity={1.1}
              bandWidth={5.4}
              transparent
            />
          </div>
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-content page-width">
            <div className="hero-kicker"><span className="live-dot" /> SUN FUYANG / NEW MEDIA · VISUAL · AI</div>
            <div className="hero-layout">
              <div className="hero-title-wrap">
                <h1 id="hero-title">
                  CONTENT<br />
                  <span>FOR</span><br />
                  REAL<br />
                  <em>GROWTH</em>
                </h1>
                <p className="hero-role">新媒体运营 · 视觉设计 · AI 创作</p>
              </div>
              <div className="hero-aside">
                <GlassSurface className="hero-glass" width="100%" height="100%" borderRadius={18} backgroundOpacity={0.2}>
                  <div className="hero-aside-inner">
                    <p>把策略、画面与执行<br />放进同一条工作流。</p>
                    <a className="hero-join" href="#contact">JOIN THE PROJECT <ArrowUpRight size={17} /></a>
                  </div>
                </GlassSurface>
              </div>
            </div>
            <div className="hero-bottomline">
              <a className="scroll-cue" href="#profile">
                <span>向下浏览</span><ArrowDown size={17} />
              </a>
              <span className="hero-coordinate">天津 / 2026 · OPEN TO COLLABORATE</span>
            </div>
          </div>
          <div className="hero-index" aria-hidden="true">01 / 05</div>
        </section>

        <div className="below-hero-stage">
          <div className="below-hero-grainient" aria-hidden="true">
            <div className="below-hero-grainient-sticky">
              <Grainient
                className="below-hero-grainient-canvas"
                color1="#964193"
                color2="#4d29db"
                color3="#24132f"
                timeSpeed={0.18}
                colorBalance={0.14}
                warpStrength={1}
                warpFrequency={8.4}
                warpSpeed={0.8}
                warpAmplitude={54}
                blendAngle={-12}
                blendSoftness={0.12}
                rotationAmount={360}
                noiseScale={1.8}
                grainAmount={0.08}
                grainScale={3.2}
                grainAnimated={false}
                contrast={1.35}
                gamma={1}
                saturation={0.9}
                centerX={0.08}
                centerY={-0.04}
                zoom={1.05}
              />
            </div>
          </div>
          <div className="below-hero-content">
        <section className="section profile-section page-width" id="profile" aria-labelledby="profile-title">
          <div className="section-heading">
            <span className="eyebrow">01 / PROFILE</span>
            <span className="section-rule" />
            <span className="section-aside">ABOUT THE OPERATOR</span>
          </div>
          <div className="profile-grid">
            <div className="portrait-column">
              <div className="portrait-frame">
                <div className="portrait-scan" aria-hidden="true" />
                <img src="/avatar.jpg" alt="孙富洋的个人照片" />
                <span className="portrait-corner portrait-corner-tl" aria-hidden="true" />
                <span className="portrait-corner portrait-corner-br" aria-hidden="true" />
                <div className="portrait-label">PERSONAL IMAGE / 01</div>
              </div>
              <p className="portrait-note">简历头像素材 · 后续可替换为正式人物图</p>
              <div className="contact-stack">
                <a href="tel:13370383991"><span>电话</span><strong>133 7038 3891</strong></a>
                <a href="mailto:3202735836@qq.com"><span>邮箱</span><strong>3202735836@qq.com</strong></a>
                <span><span>常驻</span><strong>天津 · 武清</strong></span>
              </div>
            </div>
            <div className="profile-copy">
              <h2 id="profile-title">我是孙富洋，<br /><em>把复杂的事做成清晰的内容。</em></h2>
              <p className="lead-copy">从短视频矩阵、信息流剪辑，到线下活动与视觉物料，我更在意一件事：创意能不能被执行，执行能不能被复盘。</p>
              <p>毕业于天津职业大学数字媒体技术专业。做过多平台账号运营、内容策划与拍摄剪辑，也参与过活动现场、人员统筹和品牌物料的完整链路。</p>
              <div className="profile-tags">
                <span>NEW MEDIA</span><span>VISUAL DESIGN</span><span>AI CREATION</span>
              </div>
              <div className="stats-grid">
                {stats.map((stat) => (
                  <GlassSurface className="stat-glass" key={stat.label} width="100%" height="100%" borderRadius={14} backgroundOpacity={0.16}>
                    <div className="stat">
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                      <small>{stat.note}</small>
                    </div>
                  </GlassSurface>
                ))}
              </div>
              <p className="data-note">* 数据来自简历自述，未独立核验；项目与案例素材将在后续版本补充。</p>
            </div>
          </div>
        </section>

        <section className="section experience-section page-width" aria-labelledby="experience-title">
          <div className="section-heading">
            <span className="eyebrow">02 / EXPERIENCE</span>
            <span className="section-rule" />
            <span className="section-aside">A PRACTICE IN MOTION</span>
          </div>
          <div className="experience-intro">
            <h2 id="experience-title">经历不是标签，<br /><span>是一次次交付。</span></h2>
            <p>不按年份排队，按我在每个现场真正做过的事来讲。</p>
          </div>
          <div className="experience-list">
            {experience.map((item) => (
              <article className="experience-row" key={item.index}>
                <span className="experience-index">{item.index}</span>
                <div className="experience-main">
                  <div className="experience-title-row">
                    <h3>{item.company}</h3>
                    <span>{item.role}</span>
                  </div>
                  <p>{item.copy}</p>
                  <div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </div>
                <ArrowUpRight size={19} />
              </article>
            ))}
          </div>
        </section>

        <section className="section projects-section" id="projects" aria-labelledby="projects-title">
          <div className="page-width">
            <div className="section-heading">
              <span className="eyebrow">03 / SELECTED WORK</span>
              <span className="section-rule" />
              <span className="section-aside">WORK IN PROGRESS</span>
            </div>
            <div className="projects-head">
              <h2 id="projects-title">精选项目<span>，先看方法。</span></h2>
              <p>当前版本用视觉概念卡呈现项目方向，后续可替换为真实截图、成片或数据证明。</p>
            </div>
            <div className="project-list">
              {projects.map((project) => (
                <article className={`project-card project-${project.tone}`} key={project.number}>
                  <div className="project-art">
                    <img className="project-photo" src={project.image} alt={project.imageAlt} />
                    <div className="art-orbit art-orbit-one" />
                    <div className="art-orbit art-orbit-two" />
                    <div className="art-crosshair" />
                    <div className="art-label">{project.meta}</div>
                    <div className="art-index">{project.number}</div>
                  </div>
                  <GlassSurface className="project-info-glass" width="100%" height="100%" borderRadius={0} backgroundOpacity={0.16}>
                    <div className="project-info">
                      <div>
                        <span className="project-type">{project.type}</span>
                        <h3>{project.title}</h3>
                      </div>
                      <p>{project.desc}</p>
                      <button className="text-link" type="button" onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}>
                        索取项目资料 <ArrowUpRight size={17} />
                      </button>
                    </div>
                  </GlassSurface>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section capabilities-section page-width" id="capabilities" aria-labelledby="capabilities-title">
          <div className="section-heading">
            <span className="eyebrow">04 / CAPABILITIES</span>
            <span className="section-rule" />
            <span className="section-aside">WHAT I BRING</span>
          </div>
          <div className="capabilities-head">
            <h2 id="capabilities-title">我擅长的，<br /><span>是把每一环接上。</span></h2>
            <p>策略、视觉、制作和现场，不把它们拆成互不相干的工种。</p>
          </div>
            <div className="capabilities-grid">
            {capabilities.map((item) => (
              <article className="capability-card" key={item.number}>
                <GlassSurface className="capability-glass" width="100%" height="100%" borderRadius={18} backgroundOpacity={0.15}>
                  <div className="capability-card-content">
                    <div className="capability-top"><span>{item.number}</span><span>{item.accent}</span></div>
                    <DotGrid />
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <span className="card-line" aria-hidden="true" />
                  </div>
                </GlassSurface>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="contact-noise" aria-hidden="true" />
          <div className="page-width contact-inner">
            <div className="section-heading contact-heading">
              <span className="eyebrow">05 / CONTACT</span>
              <span className="section-rule" />
              <span className="section-aside">LET'S MAKE SOMETHING USEFUL</span>
            </div>
            <div className="contact-main">
              <p className="contact-kicker">如果你有一个需要被看见的项目</p>
              <h2 id="contact-title">我们从一句话开始。</h2>
              <a className="contact-email" href="mailto:3202735836@qq.com">3202735836@qq.com <ArrowUpRight size={28} /></a>
            </div>
            <div className="contact-footer">
              <span>孙富洋 / NEW MEDIA · VISUAL · AI</span>
              <span>天津 · 2026</span>
              <a href="#top">返回顶部 <ArrowUpRight size={15} /></a>
            </div>
          </div>
        </section>
          </div>
        </div>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
