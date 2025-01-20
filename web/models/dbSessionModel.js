import prisma from "../config/db.server.js";

export const GetSessionByShopName = async (shopName) => {
  return await prisma.session.findFirst({ where: { shop: shopName } });
};
