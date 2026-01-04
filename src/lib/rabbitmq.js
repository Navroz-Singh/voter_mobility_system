import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

// 1. CHANGE TO v5
const QUEUE_NAME = "relocation_ledger_queue_v7";
const DLQ_NAME = "relocation_ledger_queue_dlq";

export async function sendToRelocationQueue(payload) {
  let connection = null;
  let channel = null;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // 2. CRITICAL FIX: Added 'arguments' to match the Worker
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": DLQ_NAME,
      },
    });

    const sent = channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );

    if (sent) {
      console.log(" [x] Sent Packet to Queue:", payload.requestId || "N/A");
    } else {
      console.warn(" [!] Queue buffer full.");
    }

    await channel.close();
    await connection.close();

    return { success: true };
  } catch (error) {
    console.error("RabbitMQ Error:", error);
    try {
      if (channel) await channel.close();
      if (connection) await connection.close();
    } catch (ignore) {}

    return { success: false, error: "Messaging Broker Offline" };
  }
}
