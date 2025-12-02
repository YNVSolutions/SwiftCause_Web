import { useState, useEffect, useCallback } from 'react';
import { organizationApi } from '../../../entities/organization/api/organizationApi';

export function useOrganizationTags(organizationId: string) {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch organization tags
  const fetchTags = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const organizationTags = await organizationApi.getOrganizationTags(organizationId);
      setTags(organizationTags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
      console.error('Error fetching organization tags:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Update organization tags
  const updateTags = useCallback(async (newTags: string[]) => {
    if (!organizationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await organizationApi.updateOrganizationTags(organizationId, newTags);
      setTags(newTags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tags');
      console.error('Error updating organization tags:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Add a single tag
  const addTag = useCallback(async (tag: string) => {
    if (!tag.trim() || tags.includes(tag.trim())) return;
    
    const newTags = [...tags, tag.trim()];
    await updateTags(newTags);
  }, [tags, updateTags]);

  // Remove a single tag
  const removeTag = useCallback(async (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    await updateTags(newTags);
  }, [tags, updateTags]);

  // Add multiple tags at once
  const addMultipleTags = useCallback(async (newTags: string[]) => {
    const uniqueNewTags = newTags.filter(tag => tag.trim() && !tags.includes(tag.trim()));
    if (uniqueNewTags.length === 0) return;
    
    const updatedTags = [...tags, ...uniqueNewTags.map(tag => tag.trim())];
    await updateTags(updatedTags);
  }, [tags, updateTags]);

  // Load tags on mount or when organizationId changes
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    fetchTags,
    updateTags,
    addTag,
    removeTag,
    addMultipleTags
  };
}