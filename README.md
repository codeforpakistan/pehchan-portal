# Pehchan 🆔

A unified digital identity framework for Pakistan, built on Keycloak to enable secure, seamless access to digital services.

[![Next.js](https://img.shields.io/badge/Next.js-13-black)](https://nextjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![Keycloak](https://img.shields.io/badge/Keycloak-22-blue)](https://www.keycloak.org/)

## Overview

Pehchan transforms Pakistan's identity infrastructure for the digital era. By providing a single, secure digital identity that works across government and private services, Pehchan eliminates the need for multiple credentials while ensuring user privacy and data control.

### Key Features

- **Universal Access**: Single sign-on across multiple services
- **Privacy-First Design**: Advanced encryption and zero-knowledge proofs
- **User Control**: Granular consent settings for data sharing
- **Modern Stack**: Built with Next.js, Tailwind CSS, and shadcn/ui
- **Open Standards**: Powered by Keycloak for robust identity management

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/codeforpakistan/pehchan.git
cd pehchan
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start Keycloak using Docker if needed:
```bash
docker-compose up -d
```

5. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Architecture

Pehchan is built with:
- **Next.js**: For server-side rendering and API routes
- **Tailwind CSS**: For utility-first styling
- **shadcn/ui**: For beautiful, accessible components
- **Keycloak**: For identity and access management

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your fork
5. Submit a pull request

## Integration Guide

### Adding Pehchan to Your Service

TBA


Found a security issue? Please report it through our [Security Policy](SECURITY.md).

## Roadmap

- [x] Core authentication system
- [ ] Integration with government services
- [ ] Mobile application
- [ ] Biometric authentication
- [ ] Private sector partnerships
- [ ] Digital signature capabilities

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by GOV.UK Verify and Singapore's Singpass
- Supported by the Civic Innovators Program

---

Built with ❤️ for Pakistan 🇵🇰
