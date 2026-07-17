import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "/images/slideshow/slide1.svg",
    title: "ACS RO Water System",
    subtitle: "Pure Water for Every Home — Since 2008",
    detail: "📍 Kambainallur Main Road, Morappur, Dharmapuri - 635305",
    cta: "Explore RO Products",
    link: "/ro-products",
  },
  {
    image: "/images/slideshow/slide2.svg",
    title: "PowerZone UPS & Batteries",
    subtitle: "Reliable Power Backup Solutions for Home & Business",
    detail: "UPS • Inverters • Tubular Batteries • SMF Batteries",
    cta: "Explore UPS Products",
    link: "/ups-products",
  },
  {
    image: "/images/slideshow/slide3.svg",
    title: "Expert RO Service & Repair",
    subtitle: "Same Day Service — Certified Technicians",
    detail: "📞 9442878041 | 8838925135",
    cta: "Book a Service",
    link: "/book-service",
  },
];

export default function Slideshow() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="slideshow">
      <div className="slideshow-track">
        <AnimatePresence mode="wait">
          {slides.map(
            (s, i) =>
              i === current && (
                <motion.div
                  key={i}
                  className="slideshow-slide active"
                  style={{ backgroundImage: `url(${s.image})` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="slideshow-overlay">
                    <motion.div
                      className="slideshow-content"
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <h1>{s.title}</h1>
                      <p className="slideshow-subtitle">{s.subtitle}</p>
                      <p className="slideshow-detail">{s.detail}</p>
                      <motion.a
                        href={s.link}
                        className="btn btn-primary btn-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        style={{ display: "inline-flex", fontSize: "0.95rem", padding: "0.75rem 2rem" }}
                      >
                        {s.cta} →
                      </motion.a>
                    </motion.div>
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
      <button className="slideshow-arrow left" onClick={prev}>‹</button>
      <button className="slideshow-arrow right" onClick={next}>›</button>
      <div className="slideshow-indicators">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`indicator ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
