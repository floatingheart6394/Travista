import { FiMail, FiGlobe, FiPhone } from "react-icons/fi";
import { FaInstagram, FaXTwitter, FaLinkedinIn, FaYoutube, FaDiscord } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main container">
        <div className="footer-brand">
          <h3>TRAVISTA</h3>
          <p>Your Smart Travel Companion</p>
          <ul className="footer-contact">
            <li><FiMail /> <span>support@travista.ai</span></li>
            <li><FiGlobe /> <span>Global | Travel Everywhere</span></li>
            <li><FiPhone /> <span>+91-Travel-AI</span></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li><a href="#explore" data-cursor-big="true">Explore</a></li>
            <li><a href="#plan" data-cursor-big="true">Plan Trips</a></li>
            <li><a href="#budget" data-cursor-big="true">Smart Budget</a></li>
            <li><a href="#exploria" data-cursor-big="true">Exploria</a></li>
            <li><a href="#" data-cursor-big="true">AI Travel Assistant</a></li>
            <li><a href="#" data-cursor-big="true">Emergency Finder</a></li>
            <li><a href="#" data-cursor-big="true">AI Travel Posts</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#" data-cursor-big="true">About Travista</a></li>
            <li><a href="#" data-cursor-big="true">Our Vision</a></li>
            <li><a href="#" data-cursor-big="true">How it Works</a></li>
            <li><a href="#" data-cursor-big="true">Careers</a></li>
            <li><a href="#" data-cursor-big="true">Press &amp; Media</a></li>
            <li><a href="#" data-cursor-big="true">Contact Us</a></li>
            <li><a href="#" data-cursor-big="true">Trust &amp; Safety</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Community</h4>
          <ul>
            <li><a href="#" data-cursor-big="true">Leaderboard</a></li>
            <li><a href="#" data-cursor-big="true">Travel Stories</a></li>
            <li><a href="#" data-cursor-big="true">Creators</a></li>
            <li><a href="#" data-cursor-big="true">Challenges</a></li>
            <li><a href="#" data-cursor-big="true">Rewards</a></li>
            <li><a href="#" data-cursor-big="true">Community Guidelines</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#" data-cursor-big="true">Help Center</a></li>
            <li><a href="#" data-cursor-big="true">FAQs</a></li>
            <li><a href="#" data-cursor-big="true">Privacy Policy</a></li>
            <li><a href="#" data-cursor-big="true">Terms &amp; Conditions</a></li>
            <li><a href="#" data-cursor-big="true">Cookie Policy</a></li>
            <li><a href="#" data-cursor-big="true">Brand Kit</a></li>
            <li><a href="#" data-cursor-big="true">Developer API</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>© 2026 Travista. All rights reserved. Travel Beyond Maps • Explore Beyond Limits.</p>
        <div className="footer-social">
          <a href="#" aria-label="Instagram" data-cursor-big="true"><FaInstagram /></a>
          <a href="#" aria-label="X" data-cursor-big="true"><FaXTwitter /></a>
          <a href="#" aria-label="LinkedIn" data-cursor-big="true"><FaLinkedinIn /></a>
          <a href="#" aria-label="YouTube" data-cursor-big="true"><FaYoutube /></a>
          <a href="#" aria-label="Discord" data-cursor-big="true"><FaDiscord /></a>
        </div>
      </div>
    </footer>
  );
}