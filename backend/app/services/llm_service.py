import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

class LLMService:
    def __init__(self):
        self.model_name = os.getenv("LLM_MODEL_NAME", "Qwen/Qwen2.5-1.5B-Instruct")
        self.tokenizer = None
        self.model = None

    def _load_model(self):
        if self.model is not None and self.tokenizer is not None:
            return

        print(f"Loading LLM model: {self.model_name}...")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        
        # 1. CUDA (Google Colab / Linux GPU server) with 4-bit Quantization
        if torch.cuda.is_available():
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_use_double_quant=True
            )
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                quantization_config=quantization_config,
                device_map="auto"
            )
        # 2. Apple Silicon Mac / CPU (Use float16 to prevent memory thrashing)
        else:
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16,
                device_map="auto"
            )
        print("LLM model loaded successfully!")

    def generate_text(self, prompt: str, max_new_tokens: int = 200, temperature: float = 0.2, do_sample: bool = False) -> str:
        self._load_model()

        messages = [
            {"role": "user", "content": prompt}
        ]
        
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        inputs = self.tokenizer(text, return_tensors="pt").to(self.model.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                do_sample=do_sample
            )
            
        generated_tokens = outputs[0][inputs["input_ids"].shape[1]:]
        answer = self.tokenizer.decode(generated_tokens, skip_special_tokens=True)
        
        return answer.strip()

llm_service = LLMService()
