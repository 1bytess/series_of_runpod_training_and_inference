# Fine-tuning Mistral-7B with Axolotl on RunPod: Complete Tutorial

## Project Overview

In this comprehensive tutorial series, we'll walk through the entire process of fine-tuning Mistral-7B-Instruct-v0.3 using Axolotl on RunPod, then deploying it with vLLM and building a web application using Next.js. This tutorial is designed for data science students with beginner to intermediate experience.

### What You'll Learn
- Setting up and configuring RunPod instances for model fine-tuning
- Using Axolotl framework for efficient fine-tuning
- Deploying fine-tuned models with vLLM
- Building a web interface with Next.js to interact with your model
- Best practices for model training and deployment

### End Goal
By the end of this tutorial, you'll have:
- A fine-tuned Mistral-7B model trained on your custom dataset
- A running vLLM server hosting your model
- A Next.js web application for interacting with your fine-tuned model

---

## Prerequisites & Account Setup

### 1. HuggingFace Account Setup

Before we begin training, you'll need to set up several accounts and prepare your data.

**Step 1: Create HuggingFace Account**
1. Go to [HuggingFace](https://huggingface.co) and create an account
2. Verify your email address

**Step 2: Get Access Token**
1. Navigate to [HuggingFace Settings > Tokens](https://huggingface.co/settings/tokens)
2. Create a new token with **Read** permissions (this is sufficient for fine-tuning)
3. Copy and save this token securely - you'll need it later

![HuggingFace Token Settings](assets/images/hf-token-settings.png)

**Step 3: Request Model Access**
1. Go to the [Mistral-7B-Instruct-v0.3 model page](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3)
2. Click "Request Access" 
3. Fill out the contact information form
4. Agree to share your contact information
5. Submit the request - access is usually granted within a few hours

![Model Access Request](assets/images/model-access-request.png)

---

## Data Preparation Tools

I've created two Python scripts to help you prepare your training data:

### Tools Available
- **`data-preparation/input.py`**: Interactive JSON data inputter
- **`data-preparation/convert.py`**: Converts to Alpaca format and uploads to HuggingFace

### Usage
```bash
cd data-preparation
python input.py    # Create your training data
python convert.py  # Convert and upload to HuggingFace
```

---

## RunPod Setup

### 1. Account Creation
1. Go to [RunPod](https://runpod.io) and create an account
2. Add payment information (you'll only pay for what you use)
3. Navigate to the sidebar and select "Fine-tuning"

### 2. Choosing Your Approach

You have two options:
- **Use RunPod's Fine-tuning Template** (recommended for beginners)
- **Custom Setup**: If you want to learn the underlying code, check out my [Mistral Fine-tune GGUF Export repository](https://github.com/1bytess/mistral-finetune-gguf-export)

For this tutorial, we'll use the fine-tuning template for simplicity.

### 3. Configuration Setup

**Required Inputs:**
- **Base Model**: `mistralai/Mistral-7B-Instruct-v0.3`
- **HuggingFace Token**: Your token from the previous step (mandatory)
- **Private Dataset**: Your HuggingFace dataset name (e.g., `bytess/zrah-personal-ai`)

![RunPod Configuration](assets/images/runpod-config.png)

### 4. GPU Selection

Choose your GPU based on your budget and training requirements:

| GPU Type | VRAM | Recommended For | Approximate Cost/hr |
|----------|------|-----------------|-------------------|
| RTX 4090 | 24GB | Development/Testing | $0.50 |
| A100 40GB | 40GB | Production Training | $1.89 |
| A100 80GB | 80GB | Large Datasets | $2.89 |
| H100 | 80GB | Fastest Training | $4.25 |

For Mistral-7B fine-tuning, **RTX 4090 (24GB)** is sufficient and cost-effective.

### 5. Pod Deployment

1. **Pod Name**: Enter a descriptive name (e.g., `mistral-7b-finetune`)
2. **Select GPU**: Choose your preferred GPU from the table above
3. **Click "Deploy On-Demand"**
4. Wait for the instance to initialize (usually 2-5 minutes)

![Pod Deployment](assets/images/pod-deployment.png)

---

## Environment Setup & Configuration

### 1. Connecting to Your Instance

Once your pod is running:
1. **Monitor the logs** to track package installation progress
2. Wait for "Ready" status
3. Connect via **SSH** or **Web Terminal** (Web Terminal is easier for beginners)

![Pod Connection Options](assets/images/pod-connection.png)

### 2. Creating Axolotl Configuration

Navigate to your workspace and create the configuration file:

```bash
nano config.yml
```

### 3. Axolotl Configuration

Copy and paste this configuration into your `config.yml` file:

```yaml
adapter: lora
base_model: mistralai/Mistral-7B-Instruct-v0.3
model_type: MistralForCausalLM
tokenizer_type: AutoTokenizer
bf16: true
dataset_processes: 32

datasets:
  - path: bytess/zrah-personal-ai  # Replace with your dataset
    type: alpaca

gradient_accumulation_steps: 4
gradient_checkpointing: false
learning_rate: 0.0002

# LoRA Configuration
lora_alpha: 32
lora_dropout: 0.05
lora_r: 16           # Or try 8 for smaller size later
lora_target_modules:
  - q_proj
  - v_proj
  - k_proj
  - o_proj
  - gate_proj
  - down_proj
  - up_proj

loraplus_lr_embedding: 1.0e-06
lr_scheduler: cosine
max_prompt_len: 512
micro_batch_size: 4  # Increase from 2 if GPU allows
num_epochs: 3
optimizer: adamw_torch
output_dir: ./outputs/zrah_model

# Optimization Settings
pretrain_multipack_attn: true
sample_packing_bin_size: 200
sample_packing_group_size: 100000
save_only_model: true
save_safetensors: true
sequence_len: 2048
shuffle_merged_datasets: true
train_on_inputs: false

trl:
  use_vllm: false

val_set_size: 0.0
weight_decay: 0.0
```

### 4. Configuration Explanation

**Key Parameters:**
- **LoRA (Low-Rank Adaptation)**: Efficient fine-tuning method that only trains a small subset of parameters
- **lora_r: 16**: Rank of the adaptation - higher values = more parameters but better adaptation
- **learning_rate: 0.0002**: Conservative learning rate to prevent overfitting
- **num_epochs: 3**: Number of training passes through your dataset
- **micro_batch_size: 4**: Batch size per GPU - adjust based on your GPU memory
- **sequence_len: 2048**: Maximum sequence length for training

### 5. Starting the Training Process

Save your configuration file and start training:

```bash
axolotl train config.yml
```

The training process will:
1. Download the base model (if not cached)
2. Load your dataset
3. Initialize the LoRA adapters
4. Begin training with progress tracking
5. Save checkpoints to `./outputs/zrah_model`

---

## Next Steps

In the next part of this tutorial, we'll cover:
- Monitoring the training process
- Evaluating your fine-tuned model
- Setting up vLLM for inference
- Building the Next.js web application

**Training typically takes 1-3 hours depending on your dataset size and GPU choice.**

---

## Troubleshooting

**Common Issues:**
- **CUDA Out of Memory**: Reduce `micro_batch_size` or `sequence_len`
- **Dataset Loading Errors**: Verify your HuggingFace token and dataset path
- **Model Access Denied**: Ensure you've been granted access to Mistral-7B-Instruct-v0.3

**Useful Commands:**
```bash
# Monitor GPU usage
nvidia-smi

# Check training logs
tail -f train.log

# List output files
ls -la ./outputs/zrah_model/
```