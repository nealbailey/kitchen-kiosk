import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { HomePageModule } from './home.module';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let queryParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    queryParams = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [HomePageModule, RouterModule.forRoot([])],
      providers: [{ provide: ActivatedRoute, useValue: { queryParamMap: queryParams.asObservable() } }]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the requested recipe ingredients and instructions', () => {
    queryParams.next(convertToParamMap({ recipe: '2' }));
    fixture.detectChanges();
    expect(component.selectedRecipe?.title).toBe('Crispy chickpea bowls');
    expect(fixture.nativeElement.querySelector('.ingredient-list').textContent).toContain('Chickpeas');
    expect(fixture.nativeElement.querySelectorAll('.instruction-list li').length).toBe(3);
  });

  it('preserves search state when returning from details', () => {
    component.homeSearchTerm = 'lemon';
    queryParams.next(convertToParamMap({ recipe: '4' }));
    queryParams.next(convertToParamMap({}));
    expect(component.detailRequested).toBe(false);
    expect(component.homeSearchTerm).toBe('lemon');
  });

  it('shows a safe fallback for an unknown recipe', () => {
    queryParams.next(convertToParamMap({ recipe: '999' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Recipe not found');
  });

  it('shows home recipes newest first', () => {
    expect(component.homeRecipes[0].title).toBe('Crispy chickpea bowls');
  });

  it('filters Home by title without changing the advanced search', () => {
    component.homeSearchTerm = '  LEMON  ';

    expect(component.homeRecipes.map(recipe => recipe.title)).toEqual(['Lemon ricotta pancakes']);
    expect(component.searchTerm).toBe('');
    expect(component.filteredRecipes.length).toBe(component.recipes.length);
  });

  it('keeps matching Home recipes newest first and restores them when cleared', () => {
    component.homeSearchTerm = 'a';
    const dates = component.homeRecipes.map(recipe => recipe.date);
    expect(dates).toEqual([...dates].sort().reverse());

    component.homeSearchTerm = '';
    expect(component.homeRecipes.length).toBe(component.recipes.length);
  });

  it('shows a no-matches message for a Home search', () => {
    component.homeSearchTerm = 'not a recipe';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No matching recipes');
  });

  it('formats date-only values without shifting the calendar day', () => {
    expect(component.formatDate('2026-10-30')).toContain('30');
  });

  it('filters recipes by ingredient', () => {
    component.searchMode = 'ingredient';
    component.searchTerm = 'chickpeas';

    expect(component.filteredRecipes.map(recipe => recipe.title)).toEqual(['Crispy chickpea bowls']);
  });

  it('opens a category as a recipe search filter', () => {
    component.openCategory(component.categories[0]);

    expect(component.activeTab).toBe('search');
    expect(component.filteredRecipes.every(recipe => recipe.category.id === component.categories[0].id)).toBe(true);
  });
});
