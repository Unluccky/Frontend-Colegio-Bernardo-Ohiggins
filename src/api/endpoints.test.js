import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  default: { get: vi.fn() },
}));

import apiClient from './client';
import { meApi } from './endpoints';

describe('meApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requests the authenticated student profile without accepting an arbitrary student id', () => {
    meApi.estudiante();
    expect(apiClient.get).toHaveBeenCalledWith('/me/estudiante');
  });

  it('requests only the authenticated guardian’s associated pupil', () => {
    meApi.pupilo();
    expect(apiClient.get).toHaveBeenCalledWith('/me/pupilo');
  });
});
