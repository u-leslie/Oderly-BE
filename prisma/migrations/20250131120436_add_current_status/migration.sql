-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "status" "OrderEventStatus" NOT NULL DEFAULT 'PENDING';
