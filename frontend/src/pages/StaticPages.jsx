import { Link } from "react-router-dom";

export function AboutPage() {
  return (
    <div className="store-page">
      <section className="store-hero about-hero"><div className="store-hero-content fade-in"><h1>About Us</h1></div></section>
      <div className="store-container" style={{maxWidth:"800px",padding:"2rem"}}>
        <div className="card glass" style={{padding:"2rem"}}>
          <h2>ACS RO Water System</h2>
          <p style={{marginTop:"1rem",lineHeight:"1.8",color:"#475569"}}>Founded in 2008 by <strong>Chennakrishnan .C</strong>, ACS RO Water System has been the trusted name in water purification and power backup solutions in Morappur, Dharmapuri for over 17 years.</p>
          <h3 style={{marginTop:"1.5rem"}}>Our Mission</h3>
          <p style={{lineHeight:"1.8",color:"#475569"}}>To provide every household and business in our region with access to pure, safe drinking water and reliable power backup — using genuine products, expert installation, and prompt service.</p>
          <h3 style={{marginTop:"1.5rem"}}>Our Vision</h3>
          <p style={{lineHeight:"1.8",color:"#475569"}}>To become the most trusted water and power solutions provider in Tamil Nadu, known for quality, integrity, and customer satisfaction.</p>
          <h3 style={{marginTop:"1.5rem"}}>Brands We Service</h3>
          <p style={{lineHeight:"1.8",color:"#475569"}}>Grand Aqua • Kent • Elpron • Aqua Grand • Aqua Fresh • Aqua Pearl • Livpure • Pureit • Aquaguard • Blue Star • PowerZone UPS</p>
          <h3 style={{marginTop:"1.5rem"}}>Achievements</h3>
          <ul style={{lineHeight:"1.8",color:"#475569",paddingLeft:"1.25rem"}}>
            <li>17+ Years of Service Excellence</li>
            <li>3,200+ Happy Customers</li>
            <li>18,000+ Installations Completed</li>
            <li>99% Client Satisfaction Rate</li>
            <li>Authorized Dealer for 11+ Brands</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="store-page">
      <section className="store-hero contact-hero"><div className="store-hero-content fade-in"><h1>Contact Us</h1></div></section>
      <div className="store-container" style={{maxWidth:"700px",padding:"2rem"}}>
        <div className="contact-card glass" style={{padding:"2rem"}}>
          <h2>ACS RO Water System</h2>
          <div className="contact-grid" style={{marginTop:"1rem"}}>
            <div>
              <h4>📍 Address</h4>
              <p style={{color:"#475569"}}>Kambainallur Main Road<br/>Opposite Bai Rice Mill<br/>Morappur, Dharmapuri<br/>Tamil Nadu - 635305</p>
              <h4 style={{marginTop:"1rem"}}>📞 Phone</h4>
              <p style={{color:"#475569"}}>9442878041<br/>8838925135</p>
              <h4 style={{marginTop:"1rem"}}>✉️ Email</h4>
              <p style={{color:"#475569"}}>acsrowater@gmail.com</p>
            </div>
            <div>
              <h4>🕐 Business Hours</h4>
              <p style={{color:"#475569"}}>Mon-Sat: 9:00 AM - 7:00 PM</p>
              <p style={{color:"#475569"}}>Sun: 10:00 AM - 2:00 PM</p>
              <h4 style={{marginTop:"1rem"}}>👤 Proprietor</h4>
              <p style={{color:"#475569"}}>Chennakrishnan .C</p>
              <p style={{color:"#475569"}}>Since 2008</p>
              <Link to="/book-service" className="btn btn-primary" style={{marginTop:"1rem"}}>Book a Service</Link>
            </div>
          </div>
          <div className="map-placeholder" style={{marginTop:"1.5rem",height:"250px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"14px",background:"#e2e8f0"}}>
            <div style={{textAlign:"center"}}><span style={{fontSize:"2.5rem"}}>📍</span><p style={{color:"#64748b",marginTop:"0.5rem"}}>Kambainallur Main Road, Morappur, Dharmapuri - 635305</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookServicePage() {
  return (
    <div className="store-page">
      <section className="store-hero service-hero"><div className="store-hero-content fade-in"><h1>Book a Service</h1><p>RO Repair • AMC • Installation • UPS Maintenance</p></div></section>
      <div className="store-container" style={{maxWidth:"560px",padding:"2rem"}}>
        <div className="card glass" style={{padding:"2rem"}}>
          <form className="form" onSubmit={(e) => { e.preventDefault(); alert("Service booked! We will call you shortly at 9442878041."); }}>
            <div className="form-group"><label>Full Name *</label><input required placeholder="Enter your name" /></div>
            <div className="form-group"><label>Phone Number *</label><input required placeholder="Enter phone number" /></div>
            <div className="form-group"><label>Service Type</label><select><option>RO Repair & Maintenance</option><option>RO Installation</option><option>AMC (Annual Maintenance)</option><option>Filter Replacement</option><option>UPS Repair</option><option>Battery Replacement</option><option>Other</option></select></div>
            <div className="form-group"><label>Address *</label><textarea required placeholder="Enter your address" /></div>
            <div className="form-group"><label>Preferred Date</label><input type="date" /></div>
            <div className="form-group"><label>Description</label><textarea placeholder="Describe the issue..." /></div>
            <button type="submit" className="btn btn-primary" style={{width:"100%"}}>Book Service</button>
          </form>
        </div>
      </div>
    </div>
  );
}
