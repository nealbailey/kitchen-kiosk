import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';

type TabId = 'home' | 'search' | 'categories' | 'authors';
type SearchMode = 'title' | 'ingredient';
type SortColumn = 'date' | 'title';
type SortDirection = 'asc' | 'desc';

interface CategoryPreview {
  id: number;
  name: string;
  icon: string;
  accent: string;
}

interface AuthorPreview {
  id: string;
  name: string;
  initials: string;
}

interface RecipePreview {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: CategoryPreview;
  author: AuthorPreview;
  ingredients: string[];
  instructions: string[];
  recommended: boolean;
}

const PREVIEW_CATEGORIES: CategoryPreview[] = [
  { id: 1, name: 'Weeknight', icon: 'flash-outline', accent: '#d66c45' },
  { id: 2, name: 'Breakfast', icon: 'sunny-outline', accent: '#c38c31' },
  { id: 3, name: 'Soups', icon: 'water-outline', accent: '#397e6b' },
  { id: 4, name: 'Pasta', icon: 'restaurant-outline', accent: '#b94f45' },
  { id: 5, name: 'Desserts', icon: 'sparkles-outline', accent: '#6878a0' },
];

const PREVIEW_AUTHORS: AuthorPreview[] = [
  { id: 'maya-chen', name: 'Maya Chen', initials: 'MC' },
  { id: 'eli-park', name: 'Eli Park', initials: 'EP' },
  { id: 'jules-rivera', name: 'Jules Rivera', initials: 'JR' },
  { id: 'sam-bell', name: 'Sam Bell', initials: 'SB' },
];

const PREVIEW_RECIPES: RecipePreview[] = [
  {
    id: 1,
    title: 'Apple oat crumble',
    summary: 'Soft cinnamon apples under a crisp oat and brown-sugar top.',
    date: '2026-09-18',
    category: PREVIEW_CATEGORIES[4],
    author: PREVIEW_AUTHORS[3],
    ingredients: ['Apples', 'Rolled oats', 'Brown sugar', 'Cinnamon'],
    instructions: ['Heat the oven to 180 C / 350 F. Slice the apples and arrange in a baking dish.', 'Mix the oats, brown sugar, and cinnamon, then scatter over the apples.', 'Bake until the apples are tender and the topping is golden. Let cool slightly before serving.'],
    recommended: true,
  },
  {
    id: 2,
    title: 'Crispy chickpea bowls',
    summary: 'Warm spiced chickpeas, crunchy greens, and lemony yogurt.',
    date: '2026-10-30',
    category: PREVIEW_CATEGORIES[0],
    author: PREVIEW_AUTHORS[0],
    ingredients: ['Chickpeas', 'Greek yogurt', 'Lemon', 'Cucumber'],
    instructions: ['Drain and dry the chickpeas, then roast at 200 C / 400 F until crisp.', 'Mix the yogurt with lemon juice. Chop the cucumber.', 'Divide the chickpeas and cucumber between bowls and finish with the lemon yogurt.'],
    recommended: true,
  },
  {
    id: 3,
    title: 'Green herb pasta',
    summary: 'A quick, bright sauce with parsley, basil, and toasted seeds.',
    date: '2026-10-20',
    category: PREVIEW_CATEGORIES[3],
    author: PREVIEW_AUTHORS[1],
    ingredients: ['Pasta', 'Parsley', 'Basil', 'Pumpkin seeds'],
    instructions: ['Cook the pasta according to its package directions, reserving a little cooking water.', 'Finely chop the parsley and basil. Toast the pumpkin seeds in a dry pan.', 'Toss the pasta with the herbs and a splash of cooking water, then finish with the seeds.'],
    recommended: false,
  },
  {
    id: 4,
    title: 'Lemon ricotta pancakes',
    summary: 'Tender breakfast pancakes with lemon zest and warm berries.',
    date: '2026-10-12',
    category: PREVIEW_CATEGORIES[1],
    author: PREVIEW_AUTHORS[2],
    ingredients: ['Ricotta', 'Lemon', 'Flour', 'Blueberries'],
    instructions: ['Mix the ricotta with lemon zest and flour, adding water gradually to make a spoonable batter.', 'Heat a nonstick pan over medium heat. Cook small spoonfuls until set underneath, then turn and cook through.', 'Warm the blueberries in a small pan and spoon over the pancakes.'],
    recommended: true,
  },
  {
    id: 5,
    title: 'Tomato and white bean stew',
    summary: 'A slow-simmered pantry supper with rosemary and crusty bread.',
    date: '2026-09-24',
    category: PREVIEW_CATEGORIES[2],
    author: PREVIEW_AUTHORS[0],
    ingredients: ['White beans', 'Tomatoes', 'Rosemary', 'Bread'],
    instructions: ['Place the tomatoes and rosemary in a saucepan and bring to a gentle simmer.', 'Add the drained beans and simmer until the sauce thickens and the beans are hot.', 'Remove the rosemary stems and serve with crusty bread.'],
    recommended: false,
  },
  {
    id: 6,
    title: 'Miso-glazed salmon',
    summary: 'Savory-sweet salmon with rice and crisp sesame greens.',
    date: '2026-10-05',
    category: PREVIEW_CATEGORIES[0],
    author: PREVIEW_AUTHORS[1],
    ingredients: ['Salmon', 'White miso', 'Rice', 'Sesame'],
    instructions: ['Cook the rice according to its package directions.', 'Mix the miso with a little water and brush over the salmon.', 'Bake the salmon at 200 C / 400 F until cooked through. Serve over rice with sesame seeds.'],
    recommended: true,
  },
];

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  readonly isPreview = !environment.production;
  readonly tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home-outline' },
    { id: 'search', label: 'Search', icon: 'search-outline' },
    { id: 'categories', label: 'Categories', icon: 'grid-outline' },
    { id: 'authors', label: 'Authors', icon: 'people-outline' },
  ];

  readonly recipes = environment.production ? [] : PREVIEW_RECIPES;
  readonly categories = environment.production ? [] : PREVIEW_CATEGORIES;
  readonly authors = environment.production ? [] : PREVIEW_AUTHORS;

  activeTab: TabId = 'home';
  searchMode: SearchMode = 'title';
  searchColumn: SortColumn = 'date';
  sortDirection: SortDirection = 'desc';
  searchTerm = '';
  homeSearchTerm = '';
  selectedCategoryId = 0;
  selectedAuthorId = 'all';
  recommendedOnly = false;
  detailRequested = false;
  selectedRecipe: RecipePreview | undefined;

  constructor() {
    const route = inject(ActivatedRoute);
    route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const recipeId = params.get('recipe');
      this.detailRequested = recipeId !== null;
      this.selectedRecipe = this.recipes.find(recipe => String(recipe.id) === recipeId);
    });
  }

  get homeRecipes(): RecipePreview[] {
    const term = this.homeSearchTerm.trim().toLocaleLowerCase();
    const matchingRecipes = this.recipes.filter(recipe => recipe.title.toLocaleLowerCase().includes(term));

    return this.sortRecipes(matchingRecipes, 'date', 'desc');
  }

  get filteredRecipes(): RecipePreview[] {
    const term = this.searchTerm.trim().toLocaleLowerCase();
    const matchingRecipes = this.recipes.filter(recipe => {
      const matchesTerm = !term || (this.searchMode === 'title'
        ? recipe.title.toLocaleLowerCase().includes(term)
        : recipe.ingredients.some(ingredient => ingredient.toLocaleLowerCase().includes(term)));
      const matchesCategory = !this.selectedCategoryId || recipe.category.id === this.selectedCategoryId;
      const matchesAuthor = this.selectedAuthorId === 'all' || recipe.author.id === this.selectedAuthorId;
      const matchesRecommendation = !this.recommendedOnly || recipe.recommended;

      return matchesTerm && matchesCategory && matchesAuthor && matchesRecommendation;
    });

    return this.sortRecipes(matchingRecipes, this.searchColumn, this.sortDirection);
  }

  selectTab(tab: TabId): void {
    this.activeTab = tab;
  }

  openCategory(category: CategoryPreview): void {
    this.selectedCategoryId = category.id;
    this.selectedAuthorId = 'all';
    this.searchTerm = '';
    this.recommendedOnly = false;
    this.activeTab = 'search';
  }

  openAuthor(author: AuthorPreview): void {
    this.selectedAuthorId = author.id;
    this.selectedCategoryId = 0;
    this.searchTerm = '';
    this.recommendedOnly = false;
    this.activeTab = 'search';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.searchMode = 'title';
    this.selectedCategoryId = 0;
    this.selectedAuthorId = 'all';
    this.searchColumn = 'date';
    this.sortDirection = 'desc';
    this.recommendedOnly = false;
  }

  categoryCount(categoryId: number): number {
    return this.recipes.filter(recipe => recipe.category.id === categoryId).length;
  }

  authorCount(authorId: string): number {
    return this.recipes.filter(recipe => recipe.author.id === authorId).length;
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(year, month - 1, day));
  }

  private sortRecipes(recipes: RecipePreview[], column: SortColumn, direction: SortDirection): RecipePreview[] {
    const multiplier = direction === 'asc' ? 1 : -1;

    return [...recipes].sort((left, right) => {
      const order = column === 'date'
        ? new Date(left.date).getTime() - new Date(right.date).getTime()
        : left.title.localeCompare(right.title);

      return order * multiplier;
    });
  }

}
