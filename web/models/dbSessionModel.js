import prisma from "../config/db.server.js";

export const GetSessionByShopName = async (shopName) => {
  let session = await prisma.session.findFirst({ where: { shop: shopName } });
  return session;
};
