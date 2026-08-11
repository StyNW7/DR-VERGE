/content/drive/MyDrive/DR-VERGE/checkpoints/teacher/teacher_final.pt already exists and matches this architecture, skipping (set force=True to redo).
Gate 2 check: {'QWK_dual': 0.6276434061400843, 'QWK_macula': 0.6415148296429447, 'QWK_disc': 0.5687743880808798, 'DualViewGain_G_internal': -0.013871423502860414}
*** GATE 2 WARNING: teacher dual-view does NOT beat its own auxiliary heads. Do not proceed to CSD training without investigating (lambda_aux too small? not enough epochs? data leakage making single-view too easy?) ***
*** If you're re-running after the InteractionFusion fix (Section 6) and this still fails, consider: more freeze/finetune epochs, a lower freeze-phase LR, or a smaller lambda_aux so the auxiliary heads compete less directly with the fusion head for the shared backbone's capacity. GATE2_PASSED is now a global flag -- later CSD cells check it and warn loudly rather than silently training on top of an unresolved Gate 2. ***



Teacher backbone loaded from /content/drive/MyDrive/DR-VERGE/checkpoints/pretrained_backbones/aptos_resnet50_backbone.pt
[teacher] epoch 0: 100%|██████████| 50/50 [00:50<00:00,  1.01s/it]
epoch 0: val_QWK=0.5567
[teacher] epoch 1: 100%|██████████| 50/50 [00:59<00:00,  1.18s/it]
epoch 1: val_QWK=0.5731
[teacher] epoch 2: 100%|██████████| 50/50 [00:58<00:00,  1.17s/it]
epoch 2: val_QWK=0.5489
[teacher] epoch 3: 100%|██████████| 50/50 [00:51<00:00,  1.03s/it]
epoch 3: val_QWK=0.5549
[teacher] epoch 4: 100%|██████████| 50/50 [00:51<00:00,  1.03s/it]
epoch 4: val_QWK=0.5666
[teacher] epoch 5: 100%|██████████| 50/50 [00:53<00:00,  1.07s/it]
epoch 5: val_QWK=0.5736
[teacher] epoch 6: 100%|██████████| 50/50 [00:59<00:00,  1.19s/it]
epoch 6: val_QWK=0.6064
[teacher] epoch 7: 100%|██████████| 50/50 [01:02<00:00,  1.25s/it]
epoch 7: val_QWK=0.6057
[teacher] epoch 8: 100%|██████████| 50/50 [00:56<00:00,  1.12s/it]
epoch 8: val_QWK=0.6261
[teacher] epoch 9: 100%|██████████| 50/50 [01:02<00:00,  1.25s/it]
epoch 9: val_QWK=0.5828
[teacher] epoch 10: 100%|██████████| 50/50 [00:59<00:00,  1.18s/it]
epoch 10: val_QWK=0.6211
[teacher] epoch 11: 100%|██████████| 50/50 [00:58<00:00,  1.18s/it]
epoch 11: val_QWK=0.6100
[teacher] epoch 12: 100%|██████████| 50/50 [00:58<00:00,  1.16s/it]
epoch 12: val_QWK=0.5963
[teacher] epoch 13: 100%|██████████| 50/50 [00:56<00:00,  1.14s/it]
epoch 13: val_QWK=0.6133
Early stopping at epoch 13
Teacher training done. Best val QWK = 0.6261
Gate 2 check: {'QWK_dual': 0.626126895747696, 'QWK_macula': 0.5597127558328447, 'QWK_disc': 0.5839242512722116, 'DualViewGain_G_internal': 0.042202644475484385}
Gate 2: PASSED.