import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Slideshow from "../components/Slideshow";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

export default function Landing() {
  const [c1, setC1] = useState(0); const [c2, setC2] = useState(0);
  const [c3, setC3] = useState(0); const [c4, setC4] = useState(0);

  useEffect(() => {
    const anim = (fn, t) => { let c=0,s=t/50; const i=setInterval(()=>{c+=s;if(c>=t){fn(t);clearInterval(i)} else fn(Math.floor(c))},30); };
    anim(setC1,17); anim(setC2,3200); anim(setC3,18000); anim(setC4,99);
  }, []);

  const brands = ["Grand Aqua","Kent","Elpron","Aqua Grand","Aqua Fresh","Aqua Pearl","Livpure","Pureit","Aquaguard","Blue Star","PowerZone"];
  const services = [
    { i:"💧", t:"RO Purifier Sales", d:"Wide range of domestic, commercial & industrial RO systems" },
    { i:"🔧", t:"RO Installation", d:"Professional installation by certified technicians" },
    { i:"🛠️", t:"Service & Maintenance", d:"Regular maintenance and repair — same day service" },
    { i:"📋", t:"AMC Packages", d:"Annual maintenance contracts for worry-free service" },
    { i:"🔄", t:"Filter Replacement", d:"Genuine filter replacements on schedule" },
    { i:"⚡", t:"UPS & Battery Sales", d:"PowerZone UPS and battery solutions for home & office" },
  ];
  const testimonials = [
    { n:"Ravi Kumar", t:"Best RO service in Dharmapuri. Quick response, genuine parts, and excellent workmanship.", r:5 },
    { n:"Lakshmi Narayanan", t:"Using their AMC for 4 years. Very satisfied — they always come on time and do thorough service.", r:5 },
    { n:"Meena Sundari", t:"Got PowerZone UPS installed for my home. Perfect installation, working flawlessly for 2 years.", r:5 },
  ];

  return (
    <div className="landing-new">
      <Slideshow />

      <motion.section className="stats-section" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <div className="stats-grid">
          {[{v:c1,s:"+",l:"Years of Service"},{v:c2,s:"+",l:"Happy Customers"},{v:c3,s:"+",l:"Installations Done"},{v:c4,s:"%",l:"Client Satisfaction"}].map(s=>(
            <motion.div key={s.l} className="stat-card stat-animated" variants={fadeUp}>
              <div className="stat-value">{s.v}{s.s}</div>
              <div className="stat-label">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section className="info-section" initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.h2 variants={fadeUp}>Why Choose ACS RO Water System?</motion.h2>
        <div className="why-grid">
          {[{i:"✅",t:"Genuine Products",d:"100% authentic parts and systems from trusted brands"},{i:"⚡",t:"Same Day Service",d:"Quick response for Morappur and nearby areas"},{i:"💰",t:"Best Price Guarantee",d:"Competitive pricing with no hidden costs"},{i:"🛡️",t:"Warranty Support",d:"Full warranty on all products and services"},{i:"👨‍🔧",t:"Certified Technicians",d:"Experienced, trained service professionals"},{i:"🏪",t:"Local Trust",d:"Serving Morappur since 2008 — your neighborhood expert"}].map((w,i)=>(
            <motion.div key={w.t} className="why-card" variants={fadeUp} custom={i}><span className="why-icon">{w.i}</span><h4>{w.t}</h4><p>{w.d}</p></motion.div>
          ))}
        </div>
      </motion.section>

      <section className="info-section bg-alt">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>Our Services</motion.h2>
        <div className="services-grid">
          {services.map((s,i)=>(<motion.div key={s.t} className="service-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}><span className="service-icon">{s.i}</span><h4>{s.t}</h4><p>{s.d}</p></motion.div>))}
        </div>
      </section>

      <motion.section className="info-section" initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.h2 variants={fadeUp}>Featured Products</motion.h2>
        <div className="featured-grid-new">
          {[{i:"💧",t:"RO Purifiers",d:"7+ top brands",l:"/ro-products"},{i:"🔧",t:"Filters & Parts",d:"30+ components",l:"/ro-products"},{i:"⚡",t:"PowerZone UPS",d:"Reliable backup",l:"/ups-products"},{i:"🔋",t:"Batteries",d:"All capacities",l:"/ups-products"}].map((f,i)=>(
            <motion.div key={f.t} variants={fadeUp} custom={i}>
              <Link to={f.l} className="featured-card-new"><span className="feat-icon">{f.i}</span><h4>{f.t}</h4><p>{f.d}</p></Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="info-section bg-alt">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>Brands We Deal With</motion.h2>
        <div className="brands-grid">
          {brands.map((b,i)=>(<motion.span key={b} className="brand-chip" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>{b}</motion.span>))}
        </div>
      </section>

      <motion.section className="info-section" initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.h2 variants={fadeUp}>Customer Testimonials</motion.h2>
        <div className="testimonial-grid">
          {testimonials.map((t,i)=>(<motion.div key={t.n} className="testimonial-card" variants={fadeUp} custom={i}><div className="stars">{"⭐".repeat(t.r)}</div><p className="testimonial-text">"{t.t}"</p><p className="testimonial-name">— {t.n}</p></motion.div>))}
        </div>
      </motion.section>

      <motion.section className="contact-section" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <div className="contact-card">
          <h2 style={{ marginBottom: "1.5rem" }}>Contact Us</h2>
          <div className="contact-grid">
            <div>
              <p><strong>🏪 ACS RO Water System</strong></p>
              <p>📍 Kambainallur Main Road, Opposite Bai Rice Mill</p>
              <p>Morappur, Dharmapuri - 635305</p>
              <p>📞 9442878041 | 8838925135</p>
              <p>✉️ acsrowater@gmail.com</p>
              <p>🕐 Mon-Sat: 9:00 AM - 7:00 PM | Sun: 10:00 AM - 2:00 PM</p>
            </div>
            <div>
              <p><strong>👤 Proprietor: Chennakrishnan .C</strong></p>
              <p>Since 2008 — 17 Years of Excellence</p>
              <Link to="/book-service" className="btn btn-primary" style={{marginTop:"0.75rem"}}>Book a Service</Link>
            </div>
          </div>
          <div style={{marginTop:"1.5rem",height:"220px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"var(--radius-lg)",background:"var(--color-slate-100)",border:"1px solid var(--color-slate-200)"}}>
            <div style={{textAlign:"center"}}>
              <span style={{fontSize:"2.5rem"}}>📍</span>
              <p style={{color:"var(--color-slate-500)",marginTop:"0.5rem"}}>Kambainallur Main Road, Morappur, Dharmapuri - 635305</p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
