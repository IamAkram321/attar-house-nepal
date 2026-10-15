import { Router } from 'express';
import { db } from '../../../../../lib/db/src/index';
import { ordersTable } from '../../../../../lib/db/src/schema/orders';
import { customOrdersTable } from '../../../../../lib/db/src/schema/custom-orders';
import { desc } from 'drizzle-orm';

const router = Router();

router.get('/my-tasks', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = req.user as any;
  const userId = Number(user.id);
  const userEmail = user.email;

  console.log('=== DEBUG: /my-tasks route called ===');
  console.log('Logged-in User ID:', userId, '(Type:', typeof userId, ')');
  console.log('Logged-in User Email:', userEmail);

  try {
    // Fetch all rows to inspect what's stored in the database
    const allCustomRequests = await db.query.customOrdersTable.findMany({
      orderBy: [desc(customOrdersTable.createdAt)],
    });
    const allOrders = await db.query.ordersTable.findMany({
      orderBy: [desc(ordersTable.createdAt)],
    });

    console.log('Total Custom Orders in DB:', allCustomRequests.length);
    if (allCustomRequests.length > 0) {
      console.log('Sample Custom Order assignment fields:', {
        id: allCustomRequests[0].id,
        assignedToId: allCustomRequests[0].assignedToId,
        typeOfAssignedToId: typeof allCustomRequests[0].assignedToId,
      });
    }

    // Flexible client-side filtering matching ID or Email
    const assignedCustomRequests = allCustomRequests.filter(
      (req: any) => req.assignedToId === userId || req.assignedToId === userEmail || String(req.assignedToId) === String(userId)
    );
    
    const assignedOrders = allOrders.filter(
      (ord: any) => ord.assignedToId === userId || ord.assignedToId === userEmail || String(ord.assignedToId) === String(userId)
    );

    console.log('Matched Custom Requests:', assignedCustomRequests.length);
    console.log('Matched Orders:', assignedOrders.length);

    return res.json({
      customRequests: assignedCustomRequests,
      orders: assignedOrders,
    });
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return res.status(500).json({ message: 'Failed to fetch assigned tasks' });
  }
});

export default router;