import { z } from "zod";
export declare const userSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
}, z.core.$strip>;
export declare const flightSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    departure_time: z.ZodString;
    price: z.ZodNumber;
}, z.core.$strip>;
export declare const bookingSchema: z.ZodObject<{
    user_id: z.ZodNumber;
    flight_id: z.ZodNumber;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map