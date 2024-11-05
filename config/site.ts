export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Pehchan Portal",
  description:
    "Your Digital Identity for Pakistan.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Sign Up",
      href: "/signup",
    },
    {
      title: "Login",
      href: "/login",
    },
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/codeforpakistan/pehchan-portal",
    docs: "https://ui.shadcn.com",
  },
}
