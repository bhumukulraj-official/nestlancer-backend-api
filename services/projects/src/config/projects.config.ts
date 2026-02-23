import { registerAs } from '@nestjs/config';

export default registerAs('projectsService', () => ({
    deliverables: {
        s3Bucket: process.env.DELIVERABLES_S3_BUCKET || 'nestlancer-deliverables',
    }
}));
