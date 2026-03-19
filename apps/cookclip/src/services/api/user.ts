import Services from '@workspace/services';

interface SavedRecipesResponse {
  savedVideoIds: string[];
}

class UserServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
  }

  getSavedRecipes(): Promise<SavedRecipesResponse> {
    return this.get<SavedRecipesResponse>('');
  }

  saveRecipe(videoId: string): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('', { videoId });
  }

  unsaveRecipe(videoId: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`?videoId=${videoId}`);
  }
}

const userServices = new UserServices({
  baseURL: '/api/user/saved-recipes',
});

export default userServices;
