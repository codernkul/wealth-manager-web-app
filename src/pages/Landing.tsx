import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Security,
  Speed,
  Support,
  CheckCircle,
  Star,
  ArrowForward,
  AccountBalance,
  ShowChart,
} from '@mui/icons-material';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AccountBalance color="primary" />,
      title: "Portfolio Management",
      description: "Comprehensive tracking of stocks, ETFs, mutual funds, and cash holdings with real-time valuation."
    },
    {
      icon: <ShowChart color="primary" />,
      title: "Market Intelligence",
      description: "Advanced analytics and insights to help you make informed investment decisions."
    },
    {
      icon: <TrendingUp color="primary" />,
      title: "Buy-the-Dips Alerts",
      description: "Automated monitoring for key support levels and strategic buying opportunities."
    },
    {
      icon: <Security color="primary" />,
      title: "Bank-Level Security",
      description: "Your financial data is protected with enterprise-grade encryption and security measures."
    },
    {
      icon: <Speed color="primary" />,
      title: "Real-Time Updates",
      description: "Live market data and portfolio updates to keep you informed of market movements."
    },
    {
      icon: <Support color="primary" />,
      title: "Expert Support",
      description: "Access to financial experts and comprehensive customer support when you need it."
    }
  ];

  const benefits = [
    "Track unlimited portfolios and holdings",
    "Real-time market data integration",
    "Automated buy-the-dips analysis",
    "Customizable alerts and notifications",
    "Advanced performance analytics",
    "Secure cloud-based storage",
    "Mobile-responsive design",
    "Expert financial insights"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Investment Banker",
      content: "The buy-the-dips alerts have transformed my investment strategy. I'm catching opportunities I would have missed.",
      avatar: "SJ",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Retirement Planner",
      content: "Finally, a platform that combines sophisticated analysis with ease of use. My portfolio management has never been better.",
      avatar: "MC",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Financial Advisor",
      content: "The market intelligence features provide insights that help me serve my clients more effectively.",
      avatar: "ER",
      rating: 5
    }
  ];

  const stats = [
    { value: "$2.5B+", label: "Assets Under Management" },
    { value: "50K+", label: "Active Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Market Monitoring" }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4} alignItems="center">
            <Box>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                Smart Wealth Management for Modern Investors
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}
              >
                Track, analyze, and optimize your investment portfolio with AI-powered insights and automated market monitoring.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                    px: 4,
                    py: 1.5
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    px: 4,
                    py: 1.5
                  }}
                >
                  Sign In
                </Button>
              </Box>
              <Box sx={{ mt: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Chip label="No Credit Card Required" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Free Trial Available" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Cancel Anytime" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Box>
            </Box>
            <Box>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop"
                alt="Financial Dashboard"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 4
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Box key={index} textAlign="center">
                <Typography variant="h3" color="primary.main" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Everything You Need to Manage Your Wealth
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Our comprehensive platform provides all the tools and insights you need to make smarter investment decisions.
            </Typography>
          </Box>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4}>
            {features.map((feature, index) => (
              <Box key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: 10, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={6} alignItems="center">
            <Box>
              <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                Why Choose Wealth Manager Pro?
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                Join thousands of investors who have transformed their portfolio management with our intelligent platform.
              </Typography>
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box>
              <Paper
                sx={{
                  p: 4,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Start Your Free Trial Today
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                  Experience the full power of our platform with no commitment. No credit card required.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                    width: '100%'
                  }}
                >
                  Get Started Now
                </Button>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Trusted by Investors Worldwide
            </Typography>
            <Typography variant="h6" color="text.secondary">
              See what our users have to say about their experience
            </Typography>
          </Box>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4}>
            {testimonials.map((testimonial, index) => (
              <Box key={index}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: 'gold', fontSize: 20 }} />
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ mb: 3, fontStyle: 'italic' }}>
                    "{testimonial.content}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            Ready to Transform Your Investment Strategy?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of successful investors using our platform to achieve their financial goals.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            endIcon={<ArrowForward />}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
              px: 6,
              py: 2,
              fontSize: '1.1rem'
            }}
          >
            Start Your Free Trial
          </Button>
          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
            No credit card required • Free 14-day trial • Cancel anytime
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
