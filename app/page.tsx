export default function Home() {
  return (
    <main className="container">
      <header>
        <h1>AI-Powered Productivity Tools</h1>
        <p className="subtitle">
          Empowering you to do more high-quality work in less time
        </p>
      </header>

      <section className="intro">
        <p>
          AI-powered productivity tools exist to help people <strong>do more high-quality work 
          in less time</strong> by letting artificial intelligence handle or assist with 
          thinking-heavy, repetitive, or time-consuming tasks.
        </p>
      </section>

      <section className="features">
        <h2>Core Purpose</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🤖 Automate Routine Work</h3>
            <p>
              Let AI handle repetitive tasks so you can focus on what matters most.
            </p>
          </div>
          <div className="feature-card">
            <h3>🧠 Enhance Decision Making</h3>
            <p>
              Get AI-powered insights and recommendations to make better decisions faster.
            </p>
          </div>
          <div className="feature-card">
            <h3>⚡ Boost Efficiency</h3>
            <p>
              Streamline workflows and eliminate bottlenecks with intelligent automation.
            </p>
          </div>
          <div className="feature-card">
            <h3>💡 Augment Creativity</h3>
            <p>
              Use AI as a creative partner to explore new ideas and possibilities.
            </p>
          </div>
        </div>
      </section>

      <section className="performance">
        <h2>Performance Monitoring</h2>
        <p>
          This application is equipped with <strong>Vercel Speed Insights</strong> to monitor
          and optimize performance metrics in real-time, ensuring the best user experience.
        </p>
      </section>

      <footer>
        <p>Built with Next.js and deployed on Vercel</p>
      </footer>
    </main>
  )
}
