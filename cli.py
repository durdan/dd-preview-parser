import argparse
from mermaid_converter import MermaidConverter

def main():
    parser = argparse.ArgumentParser(description='Convert Mermaid diagrams to PNG images')
    parser.add_argument('directory', nargs='?', default='.', 
                       help='Directory to scan for .mmd files (default: current)')
    parser.add_argument('-H', '--height', type=int, default=600,
                       help='Output image height (default: 600)')
    parser.add_argument('-w', '--workers', type=int, default=4,
                       help='Number of parallel workers (default: 4)')
    
    args = parser.parse_args()
    
    converter = MermaidConverter(height=args.height, workers=args.workers)
    converter.convert_directory(args.directory)

if __name__ == "__main__":
    main()