// WebAssembly Filter System
class WASMFilterSystem {
    private wasmModule: WebAssembly.Instance | null = null;
    private isInitialized: boolean = false;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        try {
            // Load WASM module
            const response = await fetch('wasm/filters.wasm');
            const buffer = await response.arrayBuffer();
            const module = await WebAssembly.compile(buffer);

            this.wasmModule = await WebAssembly.instantiate(module, {
                env: {
                    memory: new WebAssembly.Memory({ initial: 256 }),
                    log: (value: number) => console.log(value),
                }
            });

            this.isInitialized = true;
            console.log('WASM Filter System initialized');
        } catch (error) {
            console.error('Failed to initialize WASM Filter System:', error);
        }
    }

    public async filterItems(
        items: any[],
        filters: Record<string, any[]>
    ): Promise<any[]> {
        if (!this.isInitialized || !this.wasmModule) {
            // Fallback to JavaScript filtering
            return this.jsFilter(items, filters);
        }

        try {
            // Convert items to format suitable for WASM
            const flatData = this.flattenData(items);

            // Allocate memory in WASM
            const { allocate, deallocate } = this.wasmModule.exports as any;
            const dataPtr = allocate(flatData.length);

            // Write data to WASM memory
            const memory = new Uint8Array((this.wasmModule.exports as any).memory.buffer);
            memory.set(flatData, dataPtr);

            // Call WASM filter function
            const filter = (this.wasmModule.exports as any).filter;
            const resultPtr = filter(dataPtr, flatData.length, JSON.stringify(filters));

            // Read results from WASM memory
            const resultLength = memory[resultPtr];
            const resultData = memory.slice(resultPtr + 4, resultPtr + 4 + resultLength);

            // Clean up
            deallocate(dataPtr);
            deallocate(resultPtr);

            // Convert back to items
            return this.unflattenData(resultData);
        } catch (error) {
            console.error('WASM filtering failed, falling back to JavaScript:', error);
            return this.jsFilter(items, filters);
        }
    }

    private jsFilter(items: any[], filters: Record<string, any[]>): any[] {
        return items.filter(item => {
            return Object.entries(filters).every(([key, values]) => {
                const itemValue = item[key];
                return values.some(value => {
                    if (typeof value === 'string' && typeof itemValue === 'string') {
                        return itemValue.toLowerCase().includes(value.toLowerCase());
                    }
                    return itemValue === value;
                });
            });
        });
    }

    private flattenData(items: any[]): Uint8Array {
        const jsonString = JSON.stringify(items);
        return new TextEncoder().encode(jsonString);
    }

    private unflattenData(data: Uint8Array): any[] {
        const jsonString = new TextDecoder().decode(data);
        return JSON.parse(jsonString);
    }
}

// Initialize WASM Filter System
const wasmFilterSystem = new WASMFilterSystem();

export { wasmFilterSystem, WASMFilterSystem };
