import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IonContent } from '@ionic/angular/lazy';
import { vi } from 'vitest';

import { HomePageModule } from './home.module';
import { HomePage } from './home.page';
import { RecipeLibrary } from '../core/recipe-library.service';
import { MobileSnapshot } from '../core/mobile-sync';

let scrollElement: HTMLElement;

beforeEach(() => {
  scrollElement = document.createElement('div');
  vi.spyOn(IonContent.prototype, 'getScrollElement').mockResolvedValue(scrollElement);
  vi.spyOn(IonContent.prototype, 'scrollToPoint').mockResolvedValue();
});

afterEach(() => vi.restoreAllMocks());

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

describe('HomePage with saved recipes', () => {
  const saved: MobileSnapshot = {
    collectionRevision: 'revision', syncedAt: '2026-11-12T12:00:00.000Z',
    categories: [{ id: 1, name: 'Dinner' }, { id: 2, name: 'Favorites' }],
    recipes: [{
      id: 7, revision: 'r1', title: 'Saved soup', description: '<p>Warm &amp; tasty</p>',
      instructions: '<p>Mix&nbsp;<strong>well</strong>.</p><img src="https://example.com/image.png">',
      date: '2026-11-12T12:00:00', primaryCategoryId: 1, categoryIds: [1, 2],
      author: 'Family Cook', recommended: true, ingredients: ['Water'],
    }],
  };
  const snapshot = signal<MobileSnapshot | null>(null);
  const unread = signal(false);
  const reachable = signal(false);
  const refreshBlockedUntil = signal<number | null>(null);
  const library = {
    native: true, snapshot, ready: signal(true), configured: signal(false), busy: signal(false),
    reachable, refreshBlockedUntil, serverName: signal('recipes.example.lan'), refreshNow: vi.fn().mockResolvedValue(undefined), message: signal('Server connection is not configured in this build.'),
    messageTime: signal<string | null>('2026-11-12T12:00:00.000Z'), unread,
    notices: signal([{ text: 'Server connection is not configured in this build.', kind: 'error', time: '2026-11-12T12:00:00.000Z' }]),
    markRead: vi.fn(() => unread.set(false)),
    initialize: vi.fn().mockResolvedValue(undefined),
  };

  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    params = new BehaviorSubject(convertToParamMap({ recipe: '7' }));
    snapshot.set(null);
    unread.set(false);
    reachable.set(false);
    refreshBlockedUntil.set(null);
    library.refreshNow.mockClear();
    await TestBed.configureTestingModule({
      imports: [HomePageModule, RouterModule.forRoot([])],
      providers: [{ provide: RecipeLibrary, useValue: library }, { provide: ActivatedRoute, useValue: { queryParamMap: params } }],
    }).compileComponents();
  });

  it('updates an open detail view from the saved snapshot and sanitizes instructions', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    expect(fixture.componentInstance.recipes).toEqual([]);
    snapshot.set(saved);
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedRecipe?.title).toBe('Saved soup');
    expect(fixture.nativeElement.querySelector('.recipe-instructions strong').textContent).toBe('well');
    expect(fixture.nativeElement.querySelector('.recipe-instructions img')).toBeNull();
    expect(fixture.componentInstance.formatDate(saved.recipes[0].date)).toContain('12');
    expect(fixture.componentInstance.categoryCount(2)).toBe(1);
    fixture.componentInstance.selectedCategoryId = 2;
    expect(fixture.componentInstance.filteredRecipes.map(recipe => recipe.title)).toEqual(['Saved soup']);
  });

  it('sorts categories by name rather than ID without changing the saved snapshot', () => {
    const categories = [{ id: 1, name: 'Soup' }, { id: 2, name: 'Breakfast' }, { id: 3, name: 'Dinner' }];
    snapshot.set({ ...saved, categories });
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect(fixture.componentInstance.categories.map(category => category.name)).toEqual(['Breakfast', 'Dinner', 'Soup']);
    expect(snapshot()?.categories).toEqual(categories);
    expect(fixture.componentInstance.recipes[0].category.id).toBe(1);
  });

  it('keeps status messages in the notification bell and flags unread notices', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const bell: HTMLElement = fixture.nativeElement.querySelector('.notification-bell');
    expect(bell).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.notification-alert')).toBeNull();
    expect(fixture.nativeElement.querySelector('main').textContent).not.toContain('not configured in this build');

    unread.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.notification-alert').textContent).toBe('!');
    expect(bell.getAttribute('aria-label')).toContain('New messages');
    expect(bell.getAttribute('aria-label')).toContain('recipes.example.lan not configured');
    expect(fixture.nativeElement.querySelector('.header-status .preview-badge')).toBeNull();
    expect(fixture.componentInstance.serverStatus()).toEqual({ state: 'offline', label: 'Not configured' });
    expect(fixture.componentInstance.recentNotices()).toEqual([]);
  });

  it('offers a manual refresh only while the server is online and dims it at the limit', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.refresh-button')).toBeNull();

    reachable.set(true);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.refresh-button');
    expect(button.nextElementSibling?.classList).toContain('notification-bell');
    expect(button.getAttribute('aria-label')).toBe('Check for recipe updates');
    button.click();
    expect(library.refreshNow).toHaveBeenCalledOnce();

    refreshBlockedUntil.set(Date.parse('2026-11-12T12:30:00.000Z'));
    fixture.detectChanges();
    expect(button.classList).toContain('limited');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('aria-label')).toContain('limit');
  });

  it('opens recipes at the top and restores the list position on Back', async () => {
    params.next(convertToParamMap({}));
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const ionContent = fixture.debugElement.query(By.directive(IonContent)).injector.get(IonContent);
    expect(fixture.componentInstance).toEqual(expect.objectContaining({ content: ionContent }));
    await fixture.whenStable();

    scrollElement.scrollTop = 1800;
    params.next(convertToParamMap({ recipe: '7' }));
    fixture.detectChanges();
    expect(ionContent.scrollToPoint).toHaveBeenLastCalledWith(0, 0, 0);

    scrollElement.scrollTop = 40;
    params.next(convertToParamMap({}));
    fixture.detectChanges();
    expect(ionContent.scrollToPoint).toHaveBeenLastCalledWith(0, 1800, 0);
  });
});
