import { shallowMount } from '@vue/test-utils';
import ReporteView17 from '@/views/ReporteView17.vue';

describe('ReporteView17', () => {
  it('should move the expense to resultados2 array when it exists in a category', () => {
    const wrapper = shallowMount(ReporteView17);
    const gasto = { categoria: 'food' };
    wrapper.setData({
      categorias: {
        food: [gasto],
      },
      resultados2: [],
    });

    wrapper.vm.devolverACategorias(gasto);

    expect(wrapper.vm.categorias.food).not.toContain(gasto);
    expect(wrapper.vm.resultados2).toContain(gasto);
  });

  it('should not modify any arrays when the expense does not exist in a category', () => {
    const wrapper = shallowMount(ReporteView17);
    const gasto = { categoria: 'food' };
    wrapper.setData({
      categorias: {
        otherCategory: [gasto],
      },
      resultados2: [],
    });

    wrapper.vm.devolverACategorias(gasto);

    expect(wrapper.vm.categorias.otherCategory).toContain(gasto);
    expect(wrapper.vm.resultados2).not.toContain(gasto);
  });

  it('should log an error message when the expense is not found in any category', () => {
    const wrapper = shallowMount(ReporteView17);
    const gasto = { categoria: 'food' };
    wrapper.setData({
      categorias: {},
      resultados2: [],
    });

    const consoleErrorSpy = jest.spyOn(console, 'error');
    wrapper.vm.devolverACategorias(gasto);

    expect(consoleErrorSpy).toHaveBeenCalledWith('El gasto no se encontró en ninguna categoría.');
  });
});