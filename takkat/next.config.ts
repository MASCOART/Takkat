/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "64.media.tumblr.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/v0/b/**" },
    ],
    domains: [
      "firebasestorage.googleapis.com",
      "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      "veiled.com",
      "nextuipro.nyc3.cdn.digitaloceanspaces.com",
      "images.unsplash.com",
      "i.pinimg.com",
      "th.bing.com",
      "ibb.co",
      "media.discordapp.net", 
      "wallpaperaccess.com",
      "img-s-msn-com.akamaized.net",
      "media.istockphoto.com",
      "weiboo.pixcelsthemes.com",
      "dricoper.com.au" ,
       "sablyn.com","www.n22menswear.com",
       "www.n22menswear.com" 
    ],
  },
};

export default nextConfig;
