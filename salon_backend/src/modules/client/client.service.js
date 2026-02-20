import clientRepository from './client.repository.js';

class ClientService {
    async createClient(tenantId, clientData) {
        if (await clientRepository.findByPhone(tenantId, clientData.phone)) {
            throw new Error('Client with this phone number already exists in this salon');
        }
        return clientRepository.create({ ...clientData, tenantId });
    }

    async queryClients(tenantId, filter, options) {
        return clientRepository.find({ ...filter, tenantId }, options);
    }

    async getClientById(tenantId, clientId) {
        const client = await clientRepository.findOne({ _id: clientId, tenantId });
        if (!client) throw new Error('Client not found');
        return client;
    }

    async updateClientById(tenantId, clientId, updateBody) {
        const client = await clientRepository.updateOne({ _id: clientId, tenantId }, updateBody);
        if (!client) throw new Error('Client not found');
        return client;
    }
}

export default new ClientService();
