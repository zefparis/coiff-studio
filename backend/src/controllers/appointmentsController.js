import * as appointmentService from '../services/appointmentService.js';

export const listAppointments = (req, res, next) => {
  try {
    const appointments = appointmentService.listAppointments();
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getAppointment = (req, res, next) => {
  try {
    const appointment = appointmentService.getAppointmentById(Number(req.params.id));
    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

export const createAppointment = (req, res, next) => {
  try {
    const appointment = appointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = (req, res, next) => {
  try {
    const appointment = appointmentService.updateAppointment(Number(req.params.id), req.body);
    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = (req, res, next) => {
  try {
    appointmentService.deleteAppointment(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
