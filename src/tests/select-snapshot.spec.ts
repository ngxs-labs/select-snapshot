import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { State, Action, StateContext, NgxsModule, Store, Selector } from '@ngxs/store';

import { SelectSnapshot, NgxsSelectSnapshotModule } from '..';

describe('SelectSnapshot', () => {
  interface AnimalsStateModel {
    pandas: string[];
  }

  type BearsStateModel = string[];

  interface BearsChildrenStateModel {
    children: string[];
  }

  class AddPanda {
    public static type = '[Animals] Add panda';
    constructor(public name: string) {}
  }

  // Used for convenience and avoiding `any` in the selector callbacks
  interface RootStateModel {
    animals: {
      pandas: string[];
      bears: string[] & {
        bearsChildren: {
          children: string[];
        };
      };
    };
  }

  @State<BearsChildrenStateModel>({
    name: 'bearsChildren',
    defaults: {
      children: []
    }
  })
  class BearsChildrenState {}

  @State<BearsStateModel>({
    name: 'bears',
    defaults: [],
    children: [BearsChildrenState]
  })
  class BearsState {}

  @State<AnimalsStateModel>({
    name: 'animals',
    defaults: {
      pandas: []
    },
    children: [BearsState]
  })
  class AnimalsState {
    @Action(AddPanda)
    public addPanda(
      { getState, patchState }: StateContext<AnimalsStateModel>,
      { name }: AddPanda
    ): void {
      const { pandas } = getState();

      patchState({
        pandas: [...pandas, name]
      });
    }
  }

  const states = [BearsChildrenState, BearsState, AnimalsState];

  function configureTestingModule<T>(component: Type<T>): void {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states), NgxsSelectSnapshotModule.forRoot()],
      declarations: [component]
    });
  }

  function expectIsArrayToBeTruthy<T>(array: T): void {
    expect(Array.isArray(array)).toBeTruthy();
  }

  it('should select the correct state using string', () => {
    // Arrange
    @Component({ template: '' })
    class TestComponent {
      @SelectSnapshot('animals')
      public animals!: AnimalsStateModel;

      @SelectSnapshot('animals.bears')
      public bears!: BearsStateModel;

      @SelectSnapshot('animals.bears.bearsChildren')
      public bearsChildren!: BearsChildrenStateModel;
    }

    // Act
    configureTestingModule(TestComponent);

    // Assert
    const { animals, bears, bearsChildren } = TestBed.createComponent(
      TestComponent
    ).componentInstance;

    expect(animals.pandas).toBeDefined();
    expectIsArrayToBeTruthy(animals.pandas);

    expect(bears).toBeDefined();
    expectIsArrayToBeTruthy(bears);

    expect(bearsChildren.children).toBeDefined();
    expectIsArrayToBeTruthy(bearsChildren.children);
  });

  it('should select the correct state using a state class', () => {
    // Arrange
    @Component({ template: '' })
    class TestComponent {
      @SelectSnapshot(AnimalsState)
      public animals!: AnimalsStateModel;

      @SelectSnapshot(BearsState)
      public bears!: BearsStateModel;

      @SelectSnapshot(BearsChildrenState)
      public bearsChildren!: BearsChildrenStateModel;
    }

    // Act
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [TestComponent]
    });

    // Assert
    const { animals, bears, bearsChildren } = TestBed.createComponent(
      TestComponent
    ).componentInstance;

    expect(animals.pandas).toBeDefined();
    expectIsArrayToBeTruthy(animals.pandas);

    expect(bears).toBeDefined();
    expectIsArrayToBeTruthy(bears);

    expect(bearsChildren.children).toBeDefined();
    expectIsArrayToBeTruthy(bearsChildren.children);
  });

  it('should select the correct state using a function', () => {
    // Arrange
    @Component({ template: '' })
    class TestComponent {
      @SelectSnapshot((state: RootStateModel) => state.animals.bears.bearsChildren)
      public bearsChildren!: BearsChildrenStateModel;
    }

    // Act
    configureTestingModule(TestComponent);

    // Assert
    const { bearsChildren } = TestBed.createComponent(TestComponent).componentInstance;

    expect(bearsChildren.children).toBeDefined();
    expectIsArrayToBeTruthy(bearsChildren.children);
  });

  it('should select the correct state after timeout', (done) => {
    // Arrange
    @Component({ template: '' })
    class TestComponent {
      @SelectSnapshot((state: RootStateModel) => state.animals)
      public animals!: AnimalsStateModel;

      constructor(store: Store) {
        setTimeout(() => {
          store.dispatch([new AddPanda('Mark'), new AddPanda('Max'), new AddPanda('Artur')]);
        }, 100);
      }
    }

    // Act
    configureTestingModule(TestComponent);

    // Assert
    const { componentInstance } = TestBed.createComponent(TestComponent);

    expectIsArrayToBeTruthy(componentInstance.animals.pandas);

    setTimeout(() => {
      expect(componentInstance.animals.pandas.length).toBe(3);
      expect(componentInstance.animals.pandas).toEqual(['Mark', 'Max', 'Artur']);
      done();
    }, 200);
  });

  it('should fail when TypeError is thrown in select lambda', () => {
    // Arrange
    @Component({ template: '' })
    class TestComponent {
      @SelectSnapshot((state: any) => state.animals.not.here)
      public something: any;
    }

    // Act
    configureTestingModule(TestComponent);

    // P.S. `store.selectSnapshot` throws exception
    try {
      const { something } = TestBed.createComponent(TestComponent).componentInstance;
    } catch ({ message }) {
      // Assert
      expect(message.indexOf(`Cannot read property 'here'`)).toBeGreaterThan(-1);
    }
  });

  it('should get the correct snapshot after dispatching multiple actions', () => {
    // Arrange
    class Increment {
      public static type = '[Counter] Increment';
    }

    @State({
      name: 'counter',
      defaults: 0
    })
    class CounterState {
      @Action(Increment)
      public increment({ setState, getState }: StateContext<number>): void {
        setState(getState() + 1);
      }
    }

    @Component({ template: '' })
    class TestComponent {
      @SelectSnapshot(CounterState)
      public counter!: number;
    }

    // Act
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState]), NgxsSelectSnapshotModule.forRoot()],
      declarations: [TestComponent]
    });

    // Assert
    const { componentInstance } = TestBed.createComponent(TestComponent);
    const store: Store = TestBed.get(Store);

    store.dispatch([new Increment(), new Increment(), new Increment()]);

    expect(componentInstance.counter).toBe(3);

    store.dispatch(new Increment());

    expect(componentInstance.counter).toBe(4);
  });

  @State<any>({
    name: 'nullselector',
    defaults: {
      foo: 'Hello'
    }
  })
  class NullSelectorState {
    @Selector()
    static notHere(state: any) {
      return state.does.not.exist;
    }
  }

  it('should not fail when TypeError is thrown in select lambda', () => {
    // Arrange
    @Component({ template: '' })
    class TestComponent {
      @SelectSnapshot(NullSelectorState.notHere)
      public state: any;
    }

    // Act
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([NullSelectorState]), NgxsSelectSnapshotModule.forRoot()],
      declarations: [TestComponent]
    });

    // Assert
    const { state } = TestBed.createComponent(TestComponent).componentInstance;
    expect(state).toBeUndefined();
  });
});
