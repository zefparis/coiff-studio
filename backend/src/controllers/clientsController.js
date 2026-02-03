import * as clientService from '../services/clientService.js';

export const listClients = (req, res, next) => {
  try {
    const clients = clientService.listClients();
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const getClient = (req, res, next) => {
  try {
    const client = clientService.getClientById(Number(req.params.id));
    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const createClient = (req, res, next) => {
  try {
    const client = clientService.createClient(req.body);
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const updateClient = (req, res, next) => {
  try {
    const client = clientService.updateClient(Number(req.params.id), req.body);
    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = (req, res, next) => {
  try {
    clientService.deleteClient(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
