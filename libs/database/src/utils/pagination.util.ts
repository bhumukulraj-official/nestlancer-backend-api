export function buildPrismaSkipTake(pagination: any) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    return { skip: (page - 1) * limit, take: limit };
}
