import { Request, Response } from 'express';
import * as projectService from '../services/project.service';
import { ProjectStatus } from '@prisma/client';

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, clientId, freelancerId } = req.query;
    const projects = await projectService.getAllProjects({
      status: status as ProjectStatus,
      clientId: clientId as string,
      freelancerId: freelancerId as string,
    });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const project = await projectService.getProjectById(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const assignFreelancers = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { freelancerIds } = req.body;
    
    if (!Array.isArray(freelancerIds)) {
      res.status(400).json({ error: 'freelancerIds must be an array' });
      return;
    }
    
    const project = await projectService.assignFreelancers(id, freelancerIds);
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProjectStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    
    const project = await projectService.updateProjectStatus(id, status as ProjectStatus);
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const dropProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await projectService.dropProject(id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await projectService.completeProject(id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
