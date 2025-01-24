import prisma from "../config/db.server.js";

export async function checkConnectionMiddleware(req, res, next) {
  const shop = res.locals.shopify.session.shop;

  let store = await prisma.store.findFirst({
    where: { storeName: shop },
    include: {
      destinationConnections: true, // All posts where authorId == 20
      sourceConnections: true, // All posts where authorId == 20
    },
  });
  const connections = store.sourceConnections;

  if (connections.length > 0) {
    return next();
  } else {
    return res
      .status(500)
      .json({ message: "Store is not connected with any marketplace" });
  }
}
