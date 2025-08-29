import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  Paper,
  Avatar,
} from '@mui/material';
import {
  School,
  Stars,
  EmojiEvents,
  FamilyRestroom,
  TrendingUp,
  Security,
  Assignment,
  Redeem,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <School sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Educational Tasks',
      description: 'Create meaningful learning activities and track progress in real-time with detailed analytics.',
    },
    {
      icon: <Stars sx={{ fontSize: 50, color: 'secondary.main' }} />,
      title: 'Points & Rewards',
      description: 'Children earn points for completed tasks and redeem them for exciting rewards they choose.',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 50, color: 'warning.main' }} />,
      title: 'Achievement System',
      description: 'Celebrate milestones and build positive habits through gamification and recognition.',
    },
    {
      icon: <FamilyRestroom sx={{ fontSize: 50, color: 'info.main' }} />,
      title: 'Family Management',
      description: 'Manage multiple children under one account with individual tracking and customization.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 50, color: 'success.main' }} />,
      title: 'Progress Reports',
      description: 'Detailed analytics and reports to track your child\'s development and growth over time.',
    },
    {
      icon: <Security sx={{ fontSize: 50, color: 'error.main' }} />,
      title: 'Safe & Secure',
      description: 'Child-friendly interface with parental controls and complete data protection.',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create Child Profiles',
      description: 'Add your children with their interests and age-appropriate settings.',
      icon: <FamilyRestroom />,
    },
    {
      step: 2,
      title: 'Assign Tasks & Set Rewards',
      description: 'Create educational tasks and set up reward wishes that motivate your children.',
      icon: <Assignment />,
    },
    {
      step: 3,
      title: 'Track Progress & Celebrate',
      description: 'Monitor your child\'s progress and celebrate their achievements together.',
      icon: <CheckCircle />,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                🌟 Kiddo Rewards
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #4CAF50 0%, #FFA726 100%)',
        color: 'white',
        py: 10,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                }}
              >
                Transform Learning into Adventure
              </Typography>
              <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 4, opacity: 0.9, lineHeight: 1.5 }}
              >
                Empower your children to develop discipline and achieve their dreams through 
                gamified learning and reward systems.
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 4 }} flexWrap="wrap" useFlexGap>
                <Chip label="Educational" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Gamified" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Family-Friendly" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Safe" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Start Your Journey
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 2,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 300,
                    height: 300,
                    mx: 'auto',
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8rem',
                  }}
                >
                  🎯
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h2" component="h2" gutterBottom>
            Why Choose Kiddo Rewards?
          </Typography>
          <Typography 
            variant="h6" 
            component="p" 
            color="text.secondary" 
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            Our platform combines the best of educational psychology and gamification 
            to create an engaging learning environment for children.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h2" component="h2" gutterBottom>
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Get started in just three simple steps
            </Typography>
          </Box>
          
          <Grid container spacing={6}>
            {howItWorks.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box textAlign="center">
                  <Paper
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontSize: '2rem',
                    }}
                  >
                    {step.step}
                  </Paper>
                  <Typography variant="h5" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h2" component="h2" gutterBottom>
            What Parents Say
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>S</Avatar>
                  <Box>
                    <Typography variant="h6">Sarah Johnson</Typography>
                    <Typography variant="body2" color="text.secondary">Mother of 2</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" style={{ fontStyle: 'italic' }}>
                  "Kiddo Rewards has transformed how my children approach learning. 
                  They're excited about completing tasks and have developed better study habits."
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>M</Avatar>
                  <Box>
                    <Typography variant="h6">Mike Chen</Typography>
                    <Typography variant="body2" color="text.secondary">Father of 3</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" style={{ fontStyle: 'italic' }}>
                  "The points system is brilliant! My kids are more motivated than ever, 
                  and I love being able to track their progress so easily."
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>L</Avatar>
                  <Box>
                    <Typography variant="h6">Lisa Williams</Typography>
                    <Typography variant="body2" color="text.secondary">Mother of 1</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" style={{ fontStyle: 'italic' }}>
                  "Finally, a tool that makes chores and homework fun! 
                  My daughter actually asks for more tasks to earn points."
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        py: 8,
        background: 'linear-gradient(135deg, #4CAF50 0%, #FFA726 100%)'
      }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" component="h2" gutterBottom>
              Ready to Start Your Family's Learning Journey?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of families who are already transforming learning into fun!
            </Typography>
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Get Started for Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 2,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                🌟 Kiddo Rewards
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Empowering families through gamified learning and positive reinforcement.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                Making learning fun, one task at a time.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                  • Task Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                  • Points & Rewards System
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                  • Progress Tracking
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                  • Family Dashboard
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Get Started
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  sx={{ borderColor: 'white', color: 'white', justifyContent: 'flex-start' }}
                >
                  Create Account
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{ borderColor: 'white', color: 'white', justifyContent: 'flex-start' }}
                >
                  Sign In
                </Button>
              </Stack>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2024 Kiddo Rewards. Made with ❤️ for families everywhere.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
