import prisma, { isDbConnected } from '../config/db.js';

// Hardcoded initial list of Inzozi Group projects
const INITIAL_PROJECTS = [
  {
    id: 'proj-impressa-id',
    name: 'Impressa',
    slug: 'impressa',
    description: 'Unified commerce and multi-vendor marketplace platform with hybrid POS and shift reconciliation.',
    status: 'active',
    repositoryUrl: 'https://github.com/Benitgilbert/impressa.git',
    liveUrl: 'https://impressa-ecom.inzozi.com',
    metrics: {
      uptime: '99.94%',
      activeUsers: 1420,
      apiHealth: 'healthy',
      serverLoad: '28%',
      weeklyRevenue: '$14,240'
    }
  },
  {
    id: 'proj-gesture-id',
    name: 'Gesture to Speech',
    slug: 'gesture-to-speech',
    description: 'AI-powered rwandan sign language translation platform converting gesture video feeds to spoken audio.',
    status: 'development',
    repositoryUrl: 'https://github.com/Benitgilbert/gesture-to-speech.git',
    liveUrl: null,
    metrics: {
      uptime: '100%',
      activeUsers: 8,
      apiHealth: 'healthy',
      serverLoad: '4%',
      weeklyRevenue: '$0'
    }
  },
  {
    id: 'proj-linker-id',
    name: 'Linker',
    slug: 'linker',
    description: 'Smart bus ticketing, routing, and real-time scheduling system for transport operators and commuters.',
    status: 'testing',
    repositoryUrl: 'https://github.com/Benitgilbert/linker.git',
    liveUrl: 'https://linker-staging.inzozi.com',
    metrics: {
      uptime: '98.85%',
      activeUsers: 84,
      apiHealth: 'warning',
      serverLoad: '67%',
      weeklyRevenue: '$180'
    }
  },
  {
    id: 'proj-homland-id',
    name: 'Homland',
    slug: 'homland',
    description: 'Smart virtual real-estate portal connecting tenants directly with property owners without physical visits.',
    status: 'planning',
    repositoryUrl: 'https://github.com/Benitgilbert/homland.git',
    liveUrl: null,
    metrics: {
      uptime: 'N/A',
      activeUsers: 0,
      apiHealth: 'inactive',
      serverLoad: '0%',
      weeklyRevenue: '$0'
    }
  }
];

// Mock Impressa products waiting for admin approval
let MOCK_IMPRESSA_APPROVALS = [
  {
    id: 'prod-approval-1',
    name: 'Custom Linen Shirt - Summer Collection',
    sellerName: 'Kigali Threads Ltd',
    price: 32.50,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=150',
    createdAt: '2026-05-20T10:30:00Z',
    status: 'pending'
  },
  {
    id: 'prod-approval-2',
    name: 'Bamboo Bluetooth Wireless Headphones',
    sellerName: 'GreenTech Rwanda',
    price: 89.00,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150',
    createdAt: '2026-05-21T08:15:00Z',
    status: 'pending'
  },
  {
    id: 'prod-approval-3',
    name: 'Organic Shea Butter Soap (Pack of 3)',
    sellerName: 'Nyungwe Natural Cosmetics',
    price: 15.00,
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1607006342411-9a3363b63b2f?w=150',
    createdAt: '2026-05-21T14:45:00Z',
    status: 'pending'
  }
];

// Mock Impressa support tickets
let MOCK_IMPRESSA_TICKETS = [
  {
    id: 'tick-impressa-1',
    subject: 'Failed payment on Order #IMP-20412',
    userEmail: 'jean.paul@gmail.com',
    priority: 'high',
    status: 'open',
    createdAt: '2026-05-21T11:20:00Z'
  },
  {
    id: 'tick-impressa-2',
    subject: 'Vendor verification approval delay',
    userEmail: 'boutique.chic@inzozi.com',
    priority: 'normal',
    status: 'in_progress',
    createdAt: '2026-05-20T15:40:00Z'
  }
];

// Get all projects
export const getProjects = async (req, res) => {
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      let projects = await prisma.project.findMany();
      if (projects.length === 0) {
        // Seed initial projects
        console.log('[ProjectController] Seeding initial projects in database...');
        await prisma.project.createMany({
          data: INITIAL_PROJECTS.map(({ metrics, ...p }) => p)
        });
        projects = await prisma.project.findMany();
      }
      
      // Inject metrics into DB records
      const projectsWithMetrics = projects.map(p => {
        const match = INITIAL_PROJECTS.find(init => init.slug === p.slug);
        return {
          ...p,
          metrics: match ? match.metrics : { uptime: '100%', activeUsers: 0, apiHealth: 'healthy', serverLoad: '0%' }
        };
      });
      
      return res.json(projectsWithMetrics);
    } catch (err) {
      console.warn('[ProjectController] Error fetching projects from database, falling back to mock:', err.message);
    }
  }

  // Fallback
  return res.json(INITIAL_PROJECTS);
};

// Get single project details & health
export const getProjectBySlug = async (req, res) => {
  const { slug } = req.params;
  const dbActive = await isDbConnected();

  let project;
  if (dbActive) {
    try {
      project = await prisma.project.findUnique({ where: { slug } });
    } catch (err) {
      console.warn('[ProjectController] Error finding project by slug in database:', err.message);
    }
  }

  if (!project) {
    project = INITIAL_PROJECTS.find(p => p.slug === slug);
  }

  if (!project) {
    return res.status(404).json({ error: `Project '${slug}' not found` });
  }

  // Add metrics
  const mockMatch = INITIAL_PROJECTS.find(p => p.slug === slug);
  return res.json({
    ...project,
    metrics: mockMatch ? mockMatch.metrics : { uptime: '100%', activeUsers: 0, apiHealth: 'healthy', serverLoad: '0%' }
  });
};

// IMPRESSA Admin Activities: List products pending approval
export const getPendingImpressaApprovals = async (req, res) => {
  // In a real environment, this controller would query the Impressa database
  // e.g. using `impressaPrismaClient.product.findMany({ where: { approvalStatus: 'pending' } })`
  // For now, we simulate this integration with mock approval data.
  res.json(MOCK_IMPRESSA_APPROVALS);
};

// IMPRESSA Admin Activities: Approve/Reject product
export const updateImpressaProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  // Update in mock store
  const productIndex = MOCK_IMPRESSA_APPROVALS.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product approval request not found' });
  }

  const updatedProduct = {
    ...MOCK_IMPRESSA_APPROVALS[productIndex],
    status: status
  };

  // Remove from pending list (in-memory)
  MOCK_IMPRESSA_APPROVALS = MOCK_IMPRESSA_APPROVALS.filter(p => p.id !== id);

  console.log(`[ProjectController] Impressa Product ID ${id} set to ${status}. Note: ${note || 'None'}`);

  return res.json({
    success: true,
    message: `Product successfully ${status}`,
    product: updatedProduct
  });
};

// IMPRESSA Admin Activities: Get Support Tickets
export const getImpressaTickets = async (req, res) => {
  res.json(MOCK_IMPRESSA_TICKETS);
};
